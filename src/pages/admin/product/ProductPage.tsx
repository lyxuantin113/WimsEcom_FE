import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Space, Card, Image, Tag, Input, Select, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ProductResponse } from '../../../types/backend';
import { useProduct } from '../hooks/useProduct';
import ProductFormModal from './components/ProductFormModal';

const AdminProductPage: React.FC = () => {
    const {
        data,
        loading,
        total,
        params,
        setParams,
        categories,
        fetchData,
        fetchCategories,
        isModalOpen,
        editingProduct,
        fileList,
        setFileList,
        form,
        handleOpenModal,
        handleCloseModal,
        handleSubmit,
        handleDelete
    } = useProduct();

    const [_searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [fetchData, fetchCategories]);

    const columns: ColumnsType<ProductResponse> = useMemo(() => [
        { title: 'ID', dataIndex: 'id', width: 50 },
        {
            title: 'Ảnh',
            dataIndex: 'image',
            render: (url) => <Image width={40} src={url} fallback="https://via.placeholder.com/40" />
        },
        { title: 'Mã', dataIndex: 'code', render: (t) => <Tag color="blue">{t}</Tag> },
        { title: 'Tên SP', dataIndex: 'name' },
        { title: 'Danh mục', dataIndex: 'categoryName' },
        { title: 'Giá', dataIndex: 'price', render: (v) => `${v?.toLocaleString()} đ` },
        { title: 'Tồn', dataIndex: 'stockQuantity' },
        {
            title: 'Hành động',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleOpenModal(record)}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            )
        }
    ], [handleOpenModal, handleDelete]);

    return (
        <Card title="Quản lý sản phẩm" extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                Thêm mới
            </Button>
        }>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space size={"large"}>
                    <Input.Search
                        placeholder="Tên sản phẩm..."
                        allowClear
                        value={params.keyword}
                        onChange={(e) => setParams({ ...params, keyword: e.target.value, page: 1 })}
                        style={{ marginTop: 8 }}
                    />

                    <Checkbox
                        checked={params.isOutOfStock}
                        onChange={(e) => setParams({ ...params, isOutOfStock: e.target.checked, page: 1 })}
                        style={{ paddingLeft: 16, paddingRight: 20, borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc' }}
                    >
                        Hết hàng
                    </Checkbox>
                    <Select
                        placeholder="-- Chọn danh mục --"
                        allowClear
                        style={{ width: 200 }}
                        value={params.categoryId}
                        onChange={(value) => setParams({ ...params, categoryId: value, page: 1 })}
                    >
                        {categories.map(category => (
                            <Select.Option key={category?.id} value={category?.id}>
                                {category?.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Space>

                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                        setSearchText('');
                        setParams({ ...params, keyword: '', isOutOfStock: false, categoryId: null, page: 1 });
                    }}
                >
                    Làm mới
                </Button>
            </div>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={{
                    current: params.page,
                    pageSize: params.size,
                    total: total,
                    onChange: (p, s) => { setParams({ ...params, page: p, size: s }); }
                }}
            />

            <ProductFormModal
                visible={isModalOpen}
                onCancel={handleCloseModal}
                onSubmit={handleSubmit}
                loading={loading}
                editingProduct={editingProduct}
                form={form}
                categories={categories}
                fileList={fileList}
                setFileList={setFileList}
            />
        </Card>
    );
};

export default AdminProductPage;
