import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Card, message, Modal, Form, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import categoryApi from '../../api/categoryApi';
import { type CategoryResponse } from '../../types/backend';

const CategoryPage: React.FC = () => {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CategoryResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // --- STATE QUẢN LÝ MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
    const [form] = Form.useForm();

    // 1. Hàm load dữ liệu từ Backend
    const fetchData = async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await categoryApi.getAll({ page, size, sortBy: 'id' });
            // @ts-ignore: Bỏ qua check type strict nếu response trả về dạng axios wrapper
            const responseData = res.data ? res.data : res; // Xử lý tùy vào axios config

            if (responseData && responseData.code === 1000) {
                setData(responseData.result.data);
                setTotal(responseData.result.totalElements);
            }
        } catch (error) {
            message.error('Không thể tải danh sách danh mục!');
        } finally {
            setLoading(false);
        }
    };

    // Chạy lần đầu khi vào trang
    useEffect(() => {
        fetchData(currentPage, pageSize);
    }, []);

    // 2. Xử lý mở Modal (Phân biệt Thêm mới / Sửa)
    const handleOpenModal = (record?: CategoryResponse) => {
        if (record) {
            // Chế độ Sửa
            setEditingCategory(record);
            form.setFieldsValue(record); // Đổ dữ liệu cũ vào form
        } else {
            // Chế độ Thêm mới
            setEditingCategory(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    // 3. Xử lý nút LƯU (Submit Form)
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            let res;
            if (editingCategory) {
                // Gọi API Update
                res = await categoryApi.update(editingCategory.id, values);
            } else {
                // Gọi API Create
                res = await categoryApi.create(values);
            }

            // @ts-ignore
            const responseData = res.data ? res.data : res;

            if (responseData && responseData.code === 1000) {
                message.success(editingCategory ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                setIsModalOpen(false);
                fetchData(currentPage, pageSize); // Load lại bảng
            } else {
                message.error(responseData.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi hệ thống');
        } finally {
            setLoading(false);
        }
    };

    // 4. Xử lý nút XÓA
    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa danh mục này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await categoryApi.delete(id);
                    // @ts-ignore
                    const responseData = res.data ? res.data : res;
                    
                    // Backend trả về void hoặc string message, check code nếu có
                    if (responseData && (responseData.code === 1000 || responseData.code === 200)) {
                         message.success('Đã xóa danh mục');
                         fetchData(currentPage, pageSize);
                    } else if (responseData === undefined) { 
                        // Trường hợp axios interceptor trả về trực tiếp data
                        message.success('Đã xóa danh mục');
                        fetchData(currentPage, pageSize);
                    }
                } catch (error) {
                    message.error('Xóa thất bại! Có thể danh mục đang chứa sản phẩm.');
                }
            }
        });
    };

    // Cấu hình các cột của bảng
    const columns: ColumnsType<CategoryResponse> = [
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
    ];

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
                        setCurrentPage(p); 
                        setPageSize(s); 
                        fetchData(p, s); 
                    }
                }}
            />

            {/* Modal Form */}
            <Modal
                title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
                open={isModalOpen}
                onOk={form.submit}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={loading}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item 
                        name="name" 
                        label="Tên danh mục" 
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input placeholder="Ví dụ: Laptop, Điện thoại..." />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default CategoryPage;