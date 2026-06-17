import React, { useEffect, useMemo } from 'react';
import { Table, Tag, Button, Typography, Tabs, Card } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { OrderResponse } from '../../../types/backend';
import type { ColumnsType } from 'antd/es/table';
import { useOrder } from '../hooks/useOrder';
import OrderDetailModal from './components/OrderDetailModal';

const { Title, Text } = Typography;

const OrderPage: React.FC = () => {
    const {
        orders,
        loading,
        statusFilter,
        setStatusFilter,
        fetchOrders,
        isModalOpen,
        selectedOrder,
        updatingStatus,
        handleOpenModal,
        handleCloseModal,
        handleUpdateStatus
    } = useOrder();

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

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

    const filteredOrders = useMemo(() => {
        return statusFilter === 'ALL'
            ? orders
            : orders.filter(o => o.status === statusFilter);
    }, [orders, statusFilter]);

    const columns: ColumnsType<OrderResponse> = useMemo(() => [
        { title: 'ID', dataIndex: 'id', width: 60, render: (id: number) => <b>#{id}</b> },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            render: (text: string, record: OrderResponse) => (
                <div>
                    <Text strong>{text}</Text> <br />
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
                    onClick={() => handleOpenModal(record)}
                >
                    Xử lý
                </Button>
            ),
        },
    ], [handleOpenModal]);

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

            <OrderDetailModal
                visible={isModalOpen}
                onCancel={handleCloseModal}
                order={selectedOrder}
                updatingStatus={updatingStatus}
                onUpdateStatus={handleUpdateStatus}
            />
        </div>
    );
};

export default OrderPage;
