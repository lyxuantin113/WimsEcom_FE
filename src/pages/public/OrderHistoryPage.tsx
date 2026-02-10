import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Typography, message, Modal, Space, Tooltip, Tabs, Card } from 'antd';
import { EyeOutlined, CloseCircleOutlined, UndoOutlined, CreditCardOutlined } from '@ant-design/icons';
import orderApi from '../../api/orderApi';
import type { OrderResponse } from '../../types/backend';
import dayjs from 'dayjs';
import paymentApi from '../../api/paymentApi';

const { Title, Text } = Typography;

const OrderHistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(false);
    
    // State cho Modal chi tiết
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

    const [selectedStatus, setSelectedStatus] = useState<string | null>("ALL");


    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderApi.getMyOrders({ page: 1, size: 100 }); // Lấy tạm 100 đơn mới nhất
            if (res && res.code === 1000) {
                setOrders(res.result.data);
            }
        } catch (error) {
            message.error("Lỗi tải lịch sử đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Hàm xử lý hủy đơn
    const handleCancel = (orderId: number) => {
        Modal.confirm({
            title: 'Hủy đơn hàng',
            content: 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này sẽ hoàn lại kho.',
            okText: 'Đồng ý hủy',
            okType: 'danger',
            cancelText: 'Đóng',
            onOk: async () => {
                try {
                    const res = await orderApi.cancelOrder(orderId);
                    if (res && res.code === 1000) {
                        message.success("Đã hủy đơn hàng thành công");
                        fetchOrders(); // Load lại bảng
                    }
                } catch (error: any) {
                    message.error(error.response?.data?.message || "Lỗi hủy đơn");
                }
            }
        });
    };

    const handlePayAgain = (orderId: number) => {
        Modal.confirm({
            title: 'Thanh toán lại',
            content: 'Bạn có chắc chắn muốn thanh toán lại đơn hàng này?',
            okText: 'Đồng ý thanh toán lại',
            okType: 'danger',
            cancelText: 'Đóng',
            onOk: async () => {
                try {
                    try {
                        // Gọi API tạo URL thanh toán
                        const vnpayRes = await paymentApi.createVNPayUrl(orderId);
                        if (vnpayRes.code === 1000) {
                            // Redirect sang Sandbox VNPay
                            message.success("Đã thanh toán lại đơn hàng thành công");
                            fetchOrders(); // Load lại bảng
                            window.location.href = vnpayRes.result;
                        } else {
                            message.error("Lỗi tạo link thanh toán VNPay");
                        }
                    } catch (err) {
                        message.error("Không thể kết nối cổng thanh toán");
                    }
                } catch (error: any) {
                    message.error(error.response?.data?.message || "Lỗi thanh toán lại");
                }
            }
        });  
    } 

    const handleRequestReturn = (orderId: number) => {
        Modal.confirm({
            title: 'Yêu cầu trả hàng',
            content: 'Bạn có chắc chắn muốn yêu cầu trả hàng này?',
            okText: 'Đồng ý yêu cầu trả hàng',
            okType: 'danger',
            cancelText: 'Đóng',
            onOk: async () => {
                try {
                    const res = await orderApi.requestReturn(orderId);
                    if (res && res.code === 1000) {
                        message.success("Đã yêu cầu trả hàng thành công");
                        fetchOrders(); // Load lại bảng
                    }
                } catch (error: any) {
                    message.error(error.response?.data?.message || "Lỗi yêu cầu trả hàng");
                }
            }
        });
    };

    // Hàm hiển thị màu cho trạng thái (Helper)
    const getStatusTag = (status: string) => {
        switch (status) {
            case 'PENDING_CONFIRMATION': return <Tag color="gold">Chờ xác nhận</Tag>;
            case 'PENDING_PAYMENT': return <Tag color="gold">Chờ thanh toán</Tag>;
            case 'PAID': return <Tag color="blue">Đã thanh toán</Tag>;
            case 'CONFIRMED': return <Tag color="blue">Đã xác nhận</Tag>;
            case 'SHIPPING': return <Tag color="cyan">Đang giao</Tag>;
            case 'COMPLETED': return <Tag color="green">Hoàn thành</Tag>;
            case 'CANCELLED': return <Tag color="red">Đã hủy</Tag>;
            case 'RETURN_REQUESTED': return <Tag color="orange">Yêu cầu trả hàng</Tag>;
            case 'RETURNED': return <Tag color="purple">Trả hàng</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            render: (text: number) => <Text strong>#{text}</Text>,
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount: number) => <Text type="danger" strong>{amount.toLocaleString()} đ</Text>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: OrderResponse) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => {
                                setSelectedOrder(record);
                                setIsModalOpen(true);
                            }} 
                        />
                    </Tooltip>

                    {/* Thanh toán lại đơn Pending_Payment */}
                    {(record.status === 'PENDING_PAYMENT') && (
                        <Tooltip title="Thanh toán lại">
                            <Button 
                                icon={<CreditCardOutlined />} 
                                onClick={() => handlePayAgain(record.id)}
                            />
                        </Tooltip>
                    )}
                    
                    {/* Chỉ hiện nút Hủy nếu đơn là PENDING hoặc CONFIRMED */}
                    {(record.status === 'PENDING_CONFIRMATION' || record.status === 'PENDING_PAYMENT' || record.status === 'CONFIRMED') && (
                        <Tooltip title="Hủy đơn hàng">
                            <Button 
                                danger 
                                icon={<CloseCircleOutlined />} 
                                onClick={() => handleCancel(record.id)}
                            />
                        </Tooltip>
                    )}

                    {record.status === 'COMPLETED' && (
                        <Tooltip 
                            title="Yêu cầu trả hàng?" 
                        >
                            <Button icon={<UndoOutlined />} type="default" danger onClick={() => handleRequestReturn(record.id)}></Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const filteredStatusOrders = selectedStatus == "ALL" ? orders : orders.filter(order => order.status === selectedStatus);
    const tabItems = [
        { key: 'ALL', label: 'Tất cả' },
        { key: 'PENDING_CONFIRMATION', label: 'Chờ xác nhận' },
        { key: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
        { key: 'PAID', label: 'Đã thanh toán' },
        { key: 'CONFIRMED', label: 'Đã xác nhận' },
        { key: 'SHIPPING', label: 'Đang giao' },
        { key: 'COMPLETED', label: 'Hoàn thành' },
        { key: 'CANCELLED', label: 'Đã hủy' },
        { key: 'RETURN_REQUESTED', label: 'Yêu cầu trả hàng' },
        { key: 'RETURNED', label: 'Trả hàng' },
    ];

    return (
        <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2}>Lịch sử đơn hàng</Title>
            <Card>
                <Tabs 
                    defaultActiveKey="ALL" 
                    items={tabItems} 
                    onChange={setSelectedStatus}
                />

                <Table 
                    columns={columns} 
                    dataSource={filteredStatusOrders} 
                    rowKey="id" 
                    loading={loading}
                />
            </Card>

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={700}
            >
                {selectedOrder && (
                    <div>
                        <div style={{ marginBottom: 20 }}>
                            <p><strong>Người nhận:</strong> {selectedOrder.customerName}</p>
                            <p><strong>SĐT:</strong> {selectedOrder.phone}</p>
                            <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
                            {selectedOrder.discountCode !== null && selectedOrder.discountCode.length > 0 && (
                                <p><strong>Mã giảm giá:</strong> {selectedOrder.discountCode}</p>
                            )}
                        </div>
                        
                        <Table
                            dataSource={selectedOrder.orderDetails}
                            rowKey="id"
                            pagination={false}
                            columns={[
                                {
                                    title: 'Sản phẩm',
                                    dataIndex: 'productName',
                                    render: (text, record) => (
                                        <div style={{ display: 'flex', alignItems: 'center', maxWidth: 200 }}>
                                            <img src={record.productImage} alt="" style={{ width: 50, height: 50, objectFit: 'cover' }} />
                                            <span style={{ marginLeft: 10 }}>{text}</span>
                                        </div>
                                    )
                                },
                                { title: 'Số lượng', dataIndex: 'quantity' },
                                { 
                                    title: 'Đơn giá', 
                                    dataIndex: 'price',
                                    render: (price) => `${price.toLocaleString()} đ`
                                },
                                {
                                    title: 'Áp dụng giảm giá',
                                    dataIndex: 'isDiscounted',
                                    render: (_text, record) => {
                                        return record.isDiscounted ? 'Có' : 'Không'
                                    }
                                }
                            ]}
                        />
                        <div style={{ marginTop: 20, textAlign: 'right' }}>
                            { selectedOrder.discountCode !== null && selectedOrder.discountCode.length > 0 && 
                            <div>
                                <Title level={5} type="danger">
                                    Tổng cộng: {(selectedOrder.totalAmount + selectedOrder.discountAmount).toLocaleString()} đ
                                </Title>
                                <Title level={5} type="danger">
                                    Giảm giá: {selectedOrder.discountAmount.toLocaleString()} đ
                                </Title>
                            </div>
                            }
                            <Title level={4} type="danger">
                                Tổng tiền: {selectedOrder.totalAmount.toLocaleString()} đ
                            </Title>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderHistoryPage;