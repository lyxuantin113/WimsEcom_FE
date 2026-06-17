import React from 'react';
import { Modal, Table, Typography } from 'antd';
import type { OrderResponse } from '../../../../types/backend';

const { Title } = Typography;

interface OrderHistoryDetailModalProps {
    visible: boolean;
    onCancel: () => void;
    selectedOrder: OrderResponse | null;
}

export const OrderHistoryDetailModal: React.FC<OrderHistoryDetailModalProps> = ({
    visible,
    onCancel,
    selectedOrder
}) => {
    return (
        <Modal
            title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
            open={visible}
            onCancel={onCancel}
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
                        {selectedOrder.discountCode !== null && selectedOrder.discountCode.length > 0 &&
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
    );
};

export default React.memo(OrderHistoryDetailModal);
