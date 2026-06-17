import React from 'react';
import { Table, Tag, Button, Typography, Space, Tooltip, Tabs, Card } from 'antd';
import { EyeOutlined, CloseCircleOutlined, UndoOutlined, CreditCardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { OrderResponse } from '../../../types/backend';
import { useOrderHistory } from '../hooks/useOrderHistory';
import OrderHistoryDetailModal from './components/OrderHistoryDetailModal';

const { Title, Text } = Typography;

const OrderHistoryPage: React.FC = () => {
    const {
        loading,
        isModalOpen,
        setIsModalOpen,
        selectedOrder,
        setSelectedOrder,
        setSelectedStatus,
        filteredStatusOrders,
        handleCancel,
        handlePayAgain,
        handleRequestReturn
    } = useOrderHistory();

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

                    {(record.status === 'PENDING_PAYMENT') && (
                        <Tooltip title="Thanh toán lại">
                            <Button
                                icon={<CreditCardOutlined />}
                                onClick={() => handlePayAgain(record.id)}
                            />
                        </Tooltip>
                    )}

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
        <div className="animate-fade-up" style={{ padding: '20px 20px 60px 20px', maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 32 }}>Lịch sử đơn hàng</Title>
            <Card className="premium-card" bordered={false} styles={{ body: { padding: '24px' } }}>
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
                    pagination={{ pageSize: 10, position: ['bottomCenter'] }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>

            <OrderHistoryDetailModal
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                selectedOrder={selectedOrder}
            />
        </div>
    );
};

export default OrderHistoryPage;
