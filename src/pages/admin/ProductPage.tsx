import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Card, message, Image, Tag, Modal, Form, Input, InputNumber, Select, Upload, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import type { CategoryResponse } from '../../types/backend';
import type { ProductResponse } from '../../types/backend';

const AdminProductPage: React.FC = () => {
    // --- STATE QUẢN LÝ BẢNG ---
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ProductResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [params, setParams] = useState({
        page: 1,
        size: 5,
        sortBy: 'createdAt',
        keyword: '',        // Tìm theo tên
        isOutOfStock: false, // Checkbox lọc hàng hết
        categoryId: null,
    });

    const [_searchText, setSearchText] = useState('');

    // --- STATE QUẢN LÝ MODAL (Create/Edit) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null); // Lưu sp đang sửa
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [fileList, setFileList] = useState<any[]>([]); 
    const [form] = Form.useForm();

    // 1. Hàm load danh sách sản phẩm
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await productApi.getAll(params);
            if (response && response.code === 1000 && response.result) {
                setData(response.result.data);
                setTotal(response.result.totalElements);
            }
        } catch (error) { message.error('Lỗi tải danh sách'); } 
        finally { setLoading(false); }
    };

    // 2. Hàm load danh mục (để đổ vào ô Select)
    const fetchCategories = async () => {
        try {
            // Lấy 100 danh mục để tìm kiếm cho dễ
            const res = await categoryApi.getAll({ page: 1, size: 100 });
            if(res && res.code === 1000 && res.result) setCategories(res.result.data);
        } catch (e) {}
    };

    // Chạy 1 lần khi vào trang
    useEffect(() => { fetchData(); fetchCategories(); }, []);

    // Chạy khi thay đổi params
    useEffect(() => {
        fetchData();
    }, [params]);

    // 3. Xử lý mở Modal (Logic Map Name -> ID nằm ở đây)
    const handleOpenModal = (record?: ProductResponse) => {
        if (record) {
            // --- CHẾ ĐỘ SỬA ---
            setEditingProduct(record);
            
            // 💡 LOGIC CÁCH 2: Tìm ID danh mục dựa vào Tên (categoryName) có sẵn
            const selectedCategory = categories.find(cat => cat.name === record.categoryName);

            form.setFieldsValue({
                ...record,
                // Nếu tìm thấy thì lấy ID điền vào, nếu không thì để null
                categoryId: selectedCategory ? selectedCategory.id : null
            });

            // Reset file upload (vì mặc định không hiện ảnh cũ trong ô upload)
            setFileList([]); 
        } else {
            // --- CHẾ ĐỘ THÊM MỚI ---
            setEditingProduct(null);
            form.resetFields();
            setFileList([]);
        }
        setIsModalOpen(true);
    };

    // 4. Xử lý SUBMIT (Create hoặc Update)
    const handleSubmit = async (values: any) => {
        try {
            const formData = new FormData();
            formData.append('code', values.code);
            formData.append('name', values.name);
            formData.append('description', values.description || '');
            formData.append('price', values.price);
            formData.append('stockQuantity', values.stockQuantity);
            
            // Backend cần categoryId, form đã có sẵn value này nhờ bước handleOpenModal
            if (values.categoryId) {
                 formData.append('categoryId', values.categoryId);
            }

            // Nếu có chọn file mới thì gửi, không thì thôi
            if (fileList.length > 0) {
                formData.append('file', fileList[0].originFileObj);
            }

            setLoading(true);
            let response;
            
            if (editingProduct) {
                // GỌI API UPDATE
                response = await productApi.update(editingProduct.id, formData);
            } else {
                // GỌI API CREATE
                response = await productApi.create(formData);
            }

            if (response && response.code === 1000) {
                message.success(editingProduct ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                setIsModalOpen(false);
                fetchData(); // Load lại bảng
            } else {
                message.error(response.message);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // 5. Xử lý XÓA
    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await productApi.delete(id);
                    if (res.code === 1000) {
                        message.success('Đã xóa sản phẩm');
                        fetchData();
                    }
                } catch (error) {
                    message.error('Xóa thất bại');
                }
            }
        });
    };

    // Cấu hình các cột của bảng
    const columns: ColumnsType<ProductResponse> = [
        { title: 'ID', dataIndex: 'id', width: 50 },
        { 
            title: 'Ảnh', 
            dataIndex: 'image', 
            render: (url) => <Image width={40} src={url} fallback="https://via.placeholder.com/40" /> 
        },
        { title: 'Mã', dataIndex: 'code', render: (t) => <Tag color="blue">{t}</Tag> },
        { title: 'Tên SP', dataIndex: 'name' },
        { title: 'Danh mục', dataIndex: 'categoryName' }, // Backend trả về tên, hiện thẳng ra
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
    ];

    return (
        <Card title="Quản lý sản phẩm" extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                Thêm mới
            </Button>
        }>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space size={"large"}>
                    {/* 1. Ô tìm kiếm */}
                    <Input.Search 
                        placeholder="Tên sản phẩm..." 
                        allowClear
                        value={params.keyword}
                        onChange={(e) => setParams({ ...params, keyword: e.target.value, page: 1 })}
                        style={{ marginTop: 8 }}
                    />

                    {/* 2. Checkbox lọc hết hàng */}
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
                        style={{ width: 200}}
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

                {/* Nút làm mới */}
                <Button 
                    icon={<ReloadOutlined />} 
                    onClick={() => {
                        setSearchText('');
                        setParams({ ...params, keyword: '', isOutOfStock: false, categoryId: null, page: 1 });
                        // Cần reset cả ô input search UI nếu muốn đẹp hoàn hảo
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

            {/* --- MODAL FORM --- */}
            <Modal
                title={editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                open={isModalOpen}
                onOk={form.submit}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={loading}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="code" label="Mã SP" rules={[{ required: true }]} style={{ flex: 1 }}>
                            {/* Khi sửa thì không cho sửa Mã */}
                            <Input placeholder="SP001" disabled={!!editingProduct} />
                        </Form.Item>
                        
                        {/* Ô chọn danh mục: Giá trị là ID, nhưng hiển thị là Tên */}
                        <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Select placeholder="Chọn danh mục">
                                {categories.map(cat => (
                                    <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="price" label="Giá bán" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                        <Form.Item name="stockQuantity" label="Tồn kho" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item label="Hình ảnh (Chọn để thay đổi)">
                        <Upload
                            listType="picture"
                            maxCount={1}
                            beforeUpload={() => false}
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                        >
                            <Button icon={<UploadOutlined />}>
                                {editingProduct ? 'Đổi ảnh khác' : 'Chọn ảnh'}
                            </Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default AdminProductPage;