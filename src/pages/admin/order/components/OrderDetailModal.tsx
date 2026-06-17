import React from 'react';
import { Modal, Typography, Table, Space, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import type { OrderResponse } from '../../../../types/backend';

const { Title, Text } = Typography;

interface OrderDetailModalProps {
    visible: boolean;
    onCancel: () => void;
    order: OrderResponse | null;
    updatingStatus: boolean;
    onUpdateStatus: (status: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
    visible,
    onCancel,
    order,
    updatingStatus,
    onUpdateStatus
}) => {
    return (
        <Modal
            title={`Chi tiết đơn hàng #${order?.id}`}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            {order && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* 1. Thông tin người nhận */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#f5f5f5', padding: 15, borderRadius: 8 }}>
                        <div>
                            <Text type="secondary">Khách hàng:</Text>
                            <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                        </div>
                        <div>
                            <Text type="secondary">Số điện thoại:</Text>
                            <div style={{ fontWeight: 500 }}>{order.phone}</div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <Text type="secondary">Địa chỉ giao hàng:</Text>
                            <div style={{ fontWeight: 500 }}>{order.address}</div>
                        </div>
                    </div>

                    {/* 2. Danh sách sản phẩm */}
                    <Table
                        dataSource={order.orderDetails}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        columns={[
                            { title: 'Sản phẩm', dataIndex: 'productName' },
                            { title: 'Ảnh', dataIndex: 'productImage', render: (src) => <img src={src} style={{ width: 40 }} alt="" /> },
                            { title: 'SL', dataIndex: 'quantity' },
                            { title: 'Đơn giá', dataIndex: 'price', render: (v) => `${v.toLocaleString()} đ` },
                            { title: 'Thành tiền', render: (_, r) => <b>{(r.price * r.quantity).toLocaleString()} đ</b> },
                        ]}
                    />
                    <div style={{ textAlign: 'right', fontSize: 16 }}>
                        Tổng tiền: <Text type="danger" strong>{order.totalAmount.toLocaleString()} đ</Text>
                    </div>

                    {/* 3. KHU VỰC CẬP NHẬT TRẠNG THÁI */}
                    <div style={{ borderTop: '1px dashed #ccc', paddingTop: 20 }}>
                        <Title level={5}>Cập nhật trạng thái đơn hàng</Title>
                        <Space wrap>
                            {order.status === 'PENDING_CONFIRMATION' && (
                                <>
                                    <Button danger onClick={() => onUpdateStatus('CANCELLED')} loading={updatingStatus}>Hủy đơn</Button>
                                    <Button type="primary" onClick={() => onUpdateStatus('CONFIRMED')} loading={updatingStatus}>Xác nhận đơn</Button>
                                </>
                            )}

                            {order.status === 'PAID' && (
                                <Button type="primary" onClick={() => onUpdateStatus('CONFIRMED')} loading={updatingStatus}>Xác nhận đơn</Button>
                            )}

                            {order.status === 'CONFIRMED' && (
                                <Button type="primary" onClick={() => onUpdateStatus('SHIPPING')} loading={updatingStatus}>Giao cho vận chuyển</Button>
                            )}

                            {order.status === 'SHIPPING' && (
                                <Button type="primary" style={{ background: 'green' }} onClick={() => onUpdateStatus('COMPLETED')} loading={updatingStatus} icon={<CheckCircleOutlined />}>
                                    Hoàn thành đơn hàng
                                </Button>
                            )}

                            {order.status === 'RETURN_REQUESTED' && (
                                <div style={{ background: '#fff1f0', padding: 10, border: '1px solid #ffa39e', borderRadius: 4 }}>
                                    <Text type="danger">Khách hàng yêu cầu trả hàng!</Text>
                                    <div style={{ marginTop: 10 }}>
                                        <Button onClick={() => onUpdateStatus('CONFIRMED')} loading={updatingStatus}>
                                            Từ chối
                                        </Button>
                                        <Button type="primary" danger onClick={() => onUpdateStatus('RETURNED')} loading={updatingStatus}>
                                            Xác nhận đã nhận hàng hoàn & Hoàn tiền
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            {(order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
                                <Text type="secondary">Đơn hàng đã kết thúc quy trình.</Text>
                            )}
                        </Space>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default React.memo(OrderDetailModal);
