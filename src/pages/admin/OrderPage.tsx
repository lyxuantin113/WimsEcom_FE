import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Typography, message, Modal, Space, Tabs, Card } from 'antd';
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import orderApi from '../../api/orderApi';
import type { OrderResponse } from '../../types/backend';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const OrderPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ALL'); // Mặc định xem tất cả

    // State cho Modal chi tiết & cập nhật
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Load danh sách đơn hàng
    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Lưu ý: Bạn có thể cần update API getAllOrders để hỗ trợ filter theo status từ Backend
            // Ở đây mình làm filter phía Frontend cho đơn giản trước (hoặc gọi API lấy all rồi lọc)
            const res = await orderApi.getAll({ page: 1, size: 100 }); 
            if (res && res.code === 1000) {
                setOrders(res.result.data);
            }
        } catch (error) {
            message.error("Lỗi tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Hàm update trạng thái
    const handleUpdateStatus = async (newStatus: string) => {
        if (!selectedOrder) return;
        setUpdatingStatus(true);
        try {
            const res = await orderApi.updateStatus(selectedOrder.id, newStatus);
            if (res && res.code === 1000) {
                message.success(`Đã cập nhật trạng thái đơn #${selectedOrder.id} thành ${newStatus}`);
                fetchOrders(); // Load lại bảng
                setIsModalOpen(false); // Đóng modal
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Lỗi cập nhật trạng thái");
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Helper hiển thị Tag màu sắc
    const getStatusTag = (status: string) => {
        const colors: Record<string, string> = {
            PENDING_CONFIRMATION: 'gold',
            PENDING_PAYMENT: 'gold',
            PAID: 'blue',
            CONFIRMED: 'blue',
            SHIPPING: 'cyan',
            COMPLETED: 'green',
            CANCELLED: 'red',
            RETURN_REQUESTED: 'orange',
            RETURNED: 'purple'
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
    };

    // Filter dữ liệu theo Tabs
    const filteredOrders = statusFilter === 'ALL' 
        ? orders 
        : orders.filter(o => o.status === statusFilter);

    // Cột bảng
    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60, render: (id: number) => <b>#{id}</b> },
        { 
            title: 'Khách hàng', 
            dataIndex: 'customerName',
            render: (text: string, record: OrderResponse) => (
                <div>
                    <Text strong>{text}</Text> <br/>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.phone}</Text>
                </div>
            )
        },
        { 
            title: 'Ngày đặt', 
            dataIndex: 'createdAt', 
            render: (d: string) => dayjs(d).format('DD/MM HH:mm') 
        },
        { 
            title: 'Tổng tiền', 
            dataIndex: 'totalAmount', 
            render: (v: number) => <Text type="danger" strong>{v.toLocaleString()} đ</Text> 
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            render: (s: string) => getStatusTag(s) 
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: OrderResponse) => (
                <Button 
                    type="primary" 
                    ghost 
                    size="small"
                    icon={<EyeOutlined />} 
                    onClick={() => {
                        setSelectedOrder(record);
                        setIsModalOpen(true);
                    }}
                >
                    Xử lý
                </Button>
            ),
        },
    ];

    // Items cho Tabs (Status)
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
        <div>
            <Title level={3}>Quản lý đơn hàng</Title>
            
            <Card>
                <Tabs 
                    defaultActiveKey="ALL" 
                    items={tabItems} 
                    onChange={(key) => setStatusFilter(key)} 
                />
                
                <Table 
                    columns={columns} 
                    dataSource={filteredOrders} 
                    rowKey="id" 
                    loading={loading} 
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* MODAL XỬ LÝ ĐƠN HÀNG */}
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* 1. Thông tin người nhận */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#f5f5f5', padding: 15, borderRadius: 8 }}>
                            <div>
                                <Text type="secondary">Khách hàng:</Text>
                                <div style={{ fontWeight: 500 }}>{selectedOrder.customerName}</div>
                            </div>
                            <div>
                                <Text type="secondary">Số điện thoại:</Text>
                                <div style={{ fontWeight: 500 }}>{selectedOrder.phone}</div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Text type="secondary">Địa chỉ giao hàng:</Text>
                                <div style={{ fontWeight: 500 }}>{selectedOrder.address}</div>
                            </div>
                        </div>

                        {/* 2. Danh sách sản phẩm */}
                        <Table
                            dataSource={selectedOrder.orderDetails}
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
                            Tổng tiền: <Text type="danger" strong>{selectedOrder.totalAmount.toLocaleString()} đ</Text>
                        </div>

                        {/* 3. KHU VỰC CẬP NHẬT TRẠNG THÁI */}
                        <div style={{ borderTop: '1px dashed #ccc', paddingTop: 20 }}>
                            <Title level={5}>Cập nhật trạng thái đơn hàng</Title>
                            <Space wrap>
                                {/* Logic hiển thị nút bấm tùy theo trạng thái hiện tại */}
                                
                                {selectedOrder.status === 'PENDING_CONFIRMATION' && (
                                    <>
                                        <Button danger onClick={() => handleUpdateStatus('CANCELLED')} loading={updatingStatus}>Hủy đơn</Button>
                                        <Button type="primary" onClick={() => handleUpdateStatus('CONFIRMED')} loading={updatingStatus}>Xác nhận đơn</Button>
                                    </>
                                )}

                                {selectedOrder.status === 'PAID' && (
                                    <Button type="primary" onClick={() => handleUpdateStatus('CONFIRMED')} loading={updatingStatus}>Xác nhận đơn</Button>
                                )}

                                {selectedOrder.status === 'CONFIRMED' && (
                                    <Button type="primary" onClick={() => handleUpdateStatus('SHIPPING')} loading={updatingStatus}>Giao cho vận chuyển</Button>
                                )}

                                {selectedOrder.status === 'SHIPPING' && (
                                    <Button type="primary" style={{ background: 'green' }} onClick={() => handleUpdateStatus('COMPLETED')} loading={updatingStatus} icon={<CheckCircleOutlined />}>
                                        Hoàn thành đơn hàng
                                    </Button>
                                )}

                                {selectedOrder.status === 'RETURN_REQUESTED' && (
                                    <div style={{ background: '#fff1f0', padding: 10, border: '1px solid #ffa39e', borderRadius: 4 }}>
                                        <Text type="danger">Khách hàng yêu cầu trả hàng!</Text>
                                        <div style={{ marginTop: 10 }}>
                                            <Button 
                                                type="primary" 
                                                danger 
                                                onClick={() => handleUpdateStatus('RETURNED')} 
                                                loading={updatingStatus}
                                            >
                                                Xác nhận đã nhận hàng hoàn & Hoàn tiền
                                            </Button>
                                            {/* Có thể thêm nút Từ chối trả hàng -> Quay lại COMPLETED nếu cần */}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Nếu đã hoàn thành hoặc hủy thì chỉ hiện status text, ko cho bấm nữa */}
                                {(selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'CANCELLED') && (
                                    <Text type="secondary">Đơn hàng đã kết thúc quy trình.</Text>
                                )}
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderPage;