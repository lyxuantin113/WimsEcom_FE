import React from 'react';
import { Modal, Form, Input, Radio, Space, Typography, Divider } from 'antd';
import { WalletOutlined, CreditCardOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';

const { Title, Text } = Typography;

interface CheckoutModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (val: boolean) => void;
    form: FormInstance;
    handleCheckoutSubmit: (values: any) => void;
    checkoutLoading: boolean;
    paymentMethod: 'COD' | 'VNPAY';
    setPaymentMethod: (val: 'COD' | 'VNPAY') => void;
    cartTotal: number;
    discountAmount: number;
    appliedCode: string;
    finalTotal: number;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isModalOpen,
    setIsModalOpen,
    form,
    handleCheckoutSubmit,
    checkoutLoading,
    paymentMethod,
    setPaymentMethod,
    cartTotal,
    discountAmount,
    appliedCode,
    finalTotal
}) => {
    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Thông tin đặt hàng</Title>}
            open={isModalOpen}
            onOk={form.submit}
            onCancel={() => setIsModalOpen(false)}
            confirmLoading={checkoutLoading}
            okText={paymentMethod === 'VNPAY' ? 'Thanh toán VNPay' : 'Hoàn tất đặt hàng'}
            cancelText="Hủy"
            width={600}
            centered
        >
            <Divider style={{ margin: '10px 0 20px 0' }} />
            
            {/* Tóm tắt đơn hàng trong Modal */}
            <div style={{ background: '#f5f5f5', padding: 15, borderRadius: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Tiền hàng:</Text>
                    <Text>{cartTotal.toLocaleString()} đ</Text>
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
                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 16 }}>1. Thông tin giao hàng</Text>
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

                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 16 }}>2. Phương thức thanh toán</Text>
                </div>

                <Form.Item name="paymentMethod">
                    <Radio.Group 
                        onChange={(e) => setPaymentMethod(e.target.value)} 
                        value={paymentMethod}
                        style={{ width: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Radio value="COD" style={{ border: '1px solid #d9d9d9', padding: '10px 15px', borderRadius: 8, width: '100%' }}>
                                <Space>
                                    <WalletOutlined style={{ color: '#faad14', fontSize: 20 }} />
                                    <div>
                                        <div style={{ fontWeight: 500 }}>Thanh toán khi nhận hàng (COD)</div>
                                        <div style={{ fontSize: 12, color: '#888' }}>Thanh toán tiền mặt khi shipper giao hàng</div>
                                    </div>
                                </Space>
                            </Radio>

                            <Radio value="VNPAY" style={{ border: '1px solid #d9d9d9', padding: '10px 15px', borderRadius: 8, width: '100%' }}>
                                <Space>
                                    <CreditCardOutlined style={{ color: '#1677ff', fontSize: 20 }} />
                                    <div>
                                        <div style={{ fontWeight: 500 }}>Thanh toán qua VNPay</div>
                                        <div style={{ fontSize: 12, color: '#888' }}>Thẻ ATM, Internet Banking, Ví VNPay</div>
                                    </div>
                                </Space>
                            </Radio>
                        </Space>
                    </Radio.Group>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CheckoutModal;
