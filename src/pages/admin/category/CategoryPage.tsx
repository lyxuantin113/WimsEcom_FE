import React, { useEffect, useMemo } from 'react';
import { Table, Button, Space, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { type CategoryResponse } from '../../../types/backend';
import { useCategory } from '../hooks/useCategory';
import CategoryFormModal from './components/CategoryFormModal';

const CategoryPage: React.FC = () => {
    const {
        data,
        loading,
        total,
        currentPage,
        pageSize,
        fetchData,
        isModalOpen,
        handleOpenModal,
        handleCloseModal,
        handleSubmit,
        handleDelete,
        editingCategory,
        form
    } = useCategory();

    useEffect(() => {
        fetchData(currentPage, pageSize);
    }, [fetchData, currentPage, pageSize]);

    const columns: ColumnsType<CategoryResponse> = useMemo(() => [
        { title: 'ID', dataIndex: 'id', width: 80, align: 'center' },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            width: 250,
            render: (text) => <span style={{ fontWeight: 600, color: '#1677ff' }}>{text}</span>
        },
        {
            title: 'Hành động',
            width: 150,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenModal(record)}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            )
        }
    ], [handleOpenModal, handleDelete]);

    return (
        <Card
            title="Quản lý Danh mục sản phẩm"
            extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                    Thêm mới
                </Button>
            }
        >
            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                bordered
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20'],
                    onChange: (p, s) => {
                        fetchData(p, s);
                    }
                }}
            />

            <CategoryFormModal
                visible={isModalOpen}
                onCancel={handleCloseModal}
                onSubmit={handleSubmit}
                loading={loading}
                editingCategory={editingCategory}
                form={form}
            />
        </Card>
    );
};

export default CategoryPage;
