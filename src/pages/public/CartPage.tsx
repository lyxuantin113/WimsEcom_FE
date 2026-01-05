import React, { useEffect, useState } from 'react';
import { Table, Button, InputNumber, Card, Typography, Space, message, Image, Divider, Popconfirm, Modal, Form, Input, Radio, Tag } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowRightOutlined, CreditCardOutlined, WalletOutlined, TagOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import cartApi from '../../api/cartApi';
import orderApi from '../../api/orderApi';
import paymentApi from '../../api/paymentApi';
import discountApi from '../../api/discountApi'; // Import API Discount
import type { CartResponse, CartItemResponse } from '../../types/backend';
import { useCart } from '../../context/CartContext';

const { Title, Text } = Typography;

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState(false);

    // --- STATE DISCOUNT ---
    const [couponCode, setCouponCode] = useState(''); // Mã đang nhập
    const [appliedCode, setAppliedCode] = useState(''); // Mã đã áp dụng thành công
    const [discountAmount, setDiscountAmount] = useState(0); // Số tiền được giảm
    const [isCheckingCode, setIsCheckingCode] = useState(false);
    const [affectedProductIds, setAffectedProductIds] = useState<number[]>([]); // Các Sản phẩm được discount

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [form] = Form.useForm();
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
    

    // Load giỏ hàng
    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await cartApi.getMyCart();
            if (res && res.code === 1000) {
                setCart(res.result);
                refreshCart();
            }
        } catch (error) {
            message.error('Lỗi tải giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Reset discount khi giỏ hàng thay đổi (để tránh sai lệch điều kiện giảm giá)
    const resetDiscount = () => {
        setAppliedCode('');
        setDiscountAmount(0);
        setCouponCode('');
        setAffectedProductIds([]);
    };

    // Xử lý tăng giảm số lượng
    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        try {
            const res = await cartApi.updateItem(itemId, newQuantity);
            if (res && res.code === 1000) {
                setCart(res.result);
                refreshCart();
                resetDiscount(); // Reset mã giảm giá
            }
        } catch (error: any) {
            message.error('Lỗi cập nhật');
        }
    };

    // Xử lý xóa item
    const handleDelete = async (itemId: number) => {
        try {
            const res = await cartApi.removeItem(itemId);
            if (res && res.code === 1000) {
                setCart(res.result);
                refreshCart();
                resetDiscount(); // Reset mã giảm giá
                message.success('Đã xóa sản phẩm');
            }
        } catch (error) {
            message.error('Lỗi xóa sản phẩm');
        }
    };

    // --- LOGIC DISCOUNT ---
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            message.warning("Vui lòng nhập mã giảm giá");
            return;
        }
        if (!cart || cart.items.length === 0) return;

        setIsCheckingCode(true);
        try {
            // Chuẩn bị payload đúng format Backend yêu cầu
            const payload = {
                code: couponCode,
                items: cart.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            const res = await discountApi.calculate(payload);
            
            if (res.code === 1000) {
                const { totalDiscount, affectedProductIds } = res.result;
                setDiscountAmount(totalDiscount);
                setAppliedCode(couponCode); 
                setAffectedProductIds(affectedProductIds);
                message.success(`Áp dụng mã thành công! Giảm ${totalDiscount.toLocaleString()}đ`);
            }
        } catch (error: any) {
            setDiscountAmount(0);
            setAppliedCode('');
            message.error(error.response?.data?.message || "Mã giảm giá không hợp lệ");
        } finally {
            setIsCheckingCode(false);
        }
    };

    // --- LOGIC CHECKOUT QUAN TRỌNG ---
    const handleCheckoutSubmit = async (values: any) => {
        if (!cart || cart.items.length === 0) return;

        setCheckoutLoading(true);
        try {
            // 1. Chuẩn bị dữ liệu tạo đơn hàng
            const orderData = {
                customerName: values.customerName,
                phone: values.phone,
                address: values.address,
                items: cart.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                totalAmount: cart.totalAmount, 
                paymentMethod: paymentMethod,  
                status: paymentMethod === 'VNPAY' ? 'PENDING_PAYMENT' : 'PENDING_CONFIRMATION',
                
                // 👇 QUAN TRỌNG: Gửi kèm mã giảm giá nếu có
                discountCode: appliedCode || "" 
            };

            // 2. Gọi API tạo đơn hàng
            const createOrderRes = await orderApi.create(orderData);

            if (createOrderRes && createOrderRes.code === 1000) {
                // 3. Phân nhánh xử lý thanh toán
                if (paymentMethod === 'VNPAY') {
                    // === FLOW VNPAY ===
                    try {
                        const vnpayRes = await paymentApi.createVNPayUrl(createOrderRes.result.id);
                        if (vnpayRes.code === 1000) {
                            window.location.href = vnpayRes.result;
                        } else {
                            message.error("Lỗi tạo link thanh toán VNPay");
                        }
                    } catch (err) {
                        message.error("Không thể kết nối cổng thanh toán");
                    }
                } else {
                    // === FLOW COD (Tiền mặt) ===
                    message.success('Đặt hàng thành công!');
                    setCart(null);
                    refreshCart();
                    setIsModalOpen(false);
                    navigate('/order-success'); 
                }
            }
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.message || 'Đặt hàng thất bại');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        form.resetFields();
    };

    // Tính tổng cuối cùng để hiển thị (Backend sẽ tính lại lần nữa để bảo mật)
    const finalTotal = cart ? Math.max(0, cart.totalAmount - discountAmount) : 0;

    // Columns Table
    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'product',
            render: (text: string, record: CartItemResponse) => {
                const isDiscounted = affectedProductIds.includes(record.productId);
                return (
                <Space>
                    <Image src={record.productImage} width={60} style={{borderRadius: 4}} />
                    <div style={{maxWidth: 200}}>
                        <Text strong>{text}</Text>
                        {isDiscounted && (
                            <Tag color="red" style={{ 
                                position: 'absolute', top: -5, left: -5, 
                                fontSize: 16, padding: '2px 6px', margin: 0, 
                                zIndex: 1, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' 
                            }}>
                                -SALE
                            </Tag>
                        )}
                    </div>
                </Space>
            );
            },
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `${price.toLocaleString()} đ`,
            responsive: ['md'] as any,
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number, record: CartItemResponse) => (
                <InputNumber 
                    min={1} 
                    value={quantity} 
                    onChange={(val) => handleQuantityChange(record.id, Number(val))}
                    style={{width: 60}}
                />
            ),
        },
        {
            title: 'Thành tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (total: number) => <Text type="danger" strong>{total?.toLocaleString()} đ</Text>,
        },
        {
            key: 'action',
            render: (_: any, record: CartItemResponse) => (
                <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.id)}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ];

    if (!cart || cart.items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <ShoppingOutlined style={{ fontSize: 60, color: '#ccc', marginBottom: 20 }} />
                <Title level={3}>Giỏ hàng trống</Title>
                <Button type="primary" onClick={() => navigate('/products')}>Tiếp tục mua sắm</Button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{marginBottom: 30}}>Giỏ hàng</Title>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 30, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
                    {/* BẢNG DANH SÁCH */}
                    <div style={{ flex: 2, minWidth: 300 }}>
                        <Table 
                            columns={columns} 
                            dataSource={cart.items} 
                            rowKey="id" 
                            pagination={false} 
                            loading={loading}
                            scroll={{ x: 600 }}
                        />
                    </div>

                    {/* TỔNG TIỀN & MÃ GIẢM GIÁ */}
                    <div style={{ flex: 1, minWidth: 300 }}>
                        <Card title="Cộng giỏ hàng" bordered={false} style={{boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                                <Text>Tạm tính:</Text>
                                <Text strong>{cart.totalAmount?.toLocaleString()} đ</Text>
                            </div>

                            {/* --- INPUT MÃ GIẢM GIÁ --- */}
                            <div style={{ marginBottom: 15 }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Input 
                                        prefix={<TagOutlined style={{color: '#aaa'}}/>} 
                                        placeholder="Mã giảm giá" 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={!!appliedCode} // Disable nếu đã áp dụng
                                    />
                                    {appliedCode ? (
                                        <Button danger icon={<CloseCircleOutlined />} onClick={resetDiscount} />
                                    ) : (
                                        <Button type="primary" onClick={handleApplyCoupon} loading={isCheckingCode}>
                                            Áp dụng
                                        </Button>
                                    )}
                                </div>
                                {appliedCode && discountAmount > 0 && (
                                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', color: '#52c41a' }}>
                                        <Space><Tag color="green">{appliedCode}</Tag> đã áp dụng</Space>
                                        <span>-{discountAmount.toLocaleString()} đ</span>
                                    </div>
                                )}
                            </div>
                            
                            <Divider style={{margin: '12px 0'}} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                <Title level={4} style={{margin: 0}}>Tổng cộng:</Title>
                                <Title level={4} type="danger" style={{margin: 0}}>
                                    {finalTotal.toLocaleString()} đ
                                </Title>
                            </div>
                            
                            <Button 
                                type="primary" 
                                size="large" 
                                block 
                                icon={<ArrowRightOutlined />}
                                onClick={handleOpenModal}
                                style={{height: 50, fontSize: 16}}
                            >
                                TIẾN HÀNH THANH TOÁN
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>

            {/* --- MODAL CHECKOUT --- */}
            <Modal
                title={<Title level={4} style={{margin: 0}}>Thông tin đặt hàng</Title>}
                open={isModalOpen}
                onOk={form.submit}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={checkoutLoading}
                okText={paymentMethod === 'VNPAY' ? 'Thanh toán VNPay' : 'Hoàn tất đặt hàng'}
                cancelText="Hủy"
                width={600}
                centered
            >
                <Divider style={{margin: '10px 0 20px 0'}} />
                
                {/* Tóm tắt đơn hàng trong Modal */}
                <div style={{ background: '#f5f5f5', padding: 15, borderRadius: 8, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>Tiền hàng:</Text>
                        <Text>{cart.totalAmount.toLocaleString()} đ</Text>
                    </div>
                    {discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'green', marginTop: 5 }}>
                            <Text type="success">Voucher ({appliedCode}):</Text>
                            <Text type="success">-{discountAmount.toLocaleString()} đ</Text>
                        </div>
                    )}
                    <Divider style={{ margin: '10px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>Thanh toán:</Text>
                        <Text strong type="danger" style={{ fontSize: 16 }}>{finalTotal.toLocaleString()} đ</Text>
                    </div>
                </div>

                <Form
                    form={form}
                    onFinish={handleCheckoutSubmit}
                    layout="vertical"
                    initialValues={{
                        customerName: '', 
                        phone: '',
                        address: ''
                    }}
                >
                    <div style={{marginBottom: 16}}>
                        <Text strong style={{fontSize: 16}}>1. Thông tin giao hàng</Text>
                    </div>

                    <Form.Item
                        name="customerName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input placeholder="Nhập họ tên người nhận" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
                    >
                        <Input placeholder="Nhập số điện thoại" size="large"/>
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Địa chỉ nhận hàng"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                        <Input.TextArea rows={2} placeholder="Số nhà, đường, phường, quận..." />
                    </Form.Item>

                    <Divider />

                    <div style={{marginBottom: 16}}>
                        <Text strong style={{fontSize: 16}}>2. Phương thức thanh toán</Text>
                    </div>

                    <Form.Item name="paymentMethod">
                        <Radio.Group 
                            onChange={(e) => setPaymentMethod(e.target.value)} 
                            value={paymentMethod}
                            style={{width: '100%'}}
                        >
                            <Space direction="vertical" style={{width: '100%'}}>
                                <Radio value="COD" style={{ border: '1px solid #d9d9d9', padding: '10px 15px', borderRadius: 8, width: '100%' }}>
                                    <Space>
                                        <WalletOutlined style={{color: '#faad14', fontSize: 20}} />
                                        <div>
                                            <div style={{fontWeight: 500}}>Thanh toán khi nhận hàng (COD)</div>
                                            <div style={{fontSize: 12, color: '#888'}}>Thanh toán tiền mặt khi shipper giao hàng</div>
                                        </div>
                                    </Space>
                                </Radio>

                                <Radio value="VNPAY" style={{ border: '1px solid #d9d9d9', padding: '10px 15px', borderRadius: 8, width: '100%' }}>
                                    <Space>
                                        <CreditCardOutlined style={{color: '#1677ff', fontSize: 20}} />
                                        <div>
                                            <div style={{fontWeight: 500}}>Thanh toán qua VNPay</div>
                                            <div style={{fontSize: 12, color: '#888'}}>Thẻ ATM, Internet Banking, Ví VNPay</div>
                                        </div>
                                    </Space>
                                </Radio>
                            </Space>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CartPage;