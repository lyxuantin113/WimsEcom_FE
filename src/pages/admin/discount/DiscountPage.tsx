import React, { useEffect, useMemo } from 'react';
import { Card, Table, Button, Tag, Space, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Discount } from '../../../types/backend';
import type { ColumnsType } from 'antd/es/table';
import { useDiscount } from '../hooks/useDiscount';
import DiscountFormModal from './components/DiscountFormModal';

const DiscountPage: React.FC = () => {
    const {
        discounts,
        loading,
        fetchDiscounts,
        isModalOpen,
        handleOpenModal,
        handleCloseModal,
        editingDiscount,
        form,
        handleFinish,
        handleDelete
    } = useDiscount();

    useEffect(() => {
        fetchDiscounts();
    }, [fetchDiscounts]);

    const columns: ColumnsType<Discount> = useMemo(() => [
        {
            title: 'Mã Code',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Tag color="blue" style={{ fontSize: 14, fontWeight: 'bold' }}>{text}</Tag>
        },
        {
            title: 'Loại giảm',
            key: 'value',
            render: (_, record) => (
                <span>
                    {record.type === 'PERCENTAGE'
                        ? `${record.value}% (Max: ${record.maxDiscountAmount?.toLocaleString()}đ)`
                        : `${record.value.toLocaleString()}đ`}
                </span>
            )
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            render: (val) => val?.toLocaleString() + 'đ'
        },
        {
            title: 'Lượt dùng',
            key: 'usage',
            render: (_, record) => (
                <Tag color={record.usedCount >= record.usageLimit ? 'red' : 'green'}>
                    {record.usedCount} / {record.usageLimit}
                </Tag>
            )
        },
        {
            title: 'Hạn dùng',
            key: 'date',
            render: (_, record) => (
                <Tooltip title={`Từ: ${dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}`}>
                    {dayjs(record.endDate).format('DD/MM/YYYY')}
                </Tooltip>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            render: (active) => <Tag color={active ? 'success' : 'default'}>{active ? 'Hoạt động' : 'Đã khóa'}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    <Popconfirm title="Xóa mã này?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        }
    ], [handleOpenModal, handleDelete]);

    return (
        <div>
            <Card title="Quản lý Khuyến mãi (Voucher)" extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Tạo Mã Mới</Button>
            }>
                <Table
                    columns={columns}
                    dataSource={discounts}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                />

                <DiscountFormModal
                    visible={isModalOpen}
                    onCancel={handleCloseModal}
                    onSubmit={handleFinish}
                    editingDiscount={editingDiscount}
                    form={form}
                />
            </Card>
        </div>
    );
};

export default DiscountPage;
