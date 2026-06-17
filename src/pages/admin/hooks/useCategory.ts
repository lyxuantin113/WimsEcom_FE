import { useState, useCallback } from 'react';
import { message, Form, Modal } from 'antd';
import categoryApi from '../../../api/categoryApi';
import type { CategoryResponse } from '../../../types/backend';

export const useCategory = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CategoryResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
    const [form] = Form.useForm();

    const fetchData = useCallback(async (page: number, size: number) => {
        setLoading(true);
        try {
            const res = await categoryApi.getAll({ page, size, sortBy: 'id' });
            if (res && res.code === 1000 && res.result) {
                setData(res.result.data);
                setTotal(res.result.totalElements);
                setCurrentPage(page);
                setPageSize(size);
            }
        } catch (error) {
            message.error('Không thể tải danh sách danh mục!');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleOpenModal = useCallback((record?: CategoryResponse) => {
        if (record) {
            setEditingCategory(record);
            form.setFieldsValue(record);
        } else {
            setEditingCategory(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    }, [form]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleSubmit = useCallback(async (values: any) => {
        setLoading(true);
        try {
            let res;
            if (editingCategory) {
                res = await categoryApi.update(editingCategory.id, values);
            } else {
                res = await categoryApi.create(values);
            }

            if (res && res.code === 1000) {
                message.success(editingCategory ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                setIsModalOpen(false);
                fetchData(currentPage, pageSize);
            } else {
                message.error(res.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi hệ thống');
        } finally {
            setLoading(false);
        }
    }, [editingCategory, currentPage, pageSize, fetchData]);

    const handleDelete = useCallback((id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa danh mục này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await categoryApi.delete(id);
                    if (res && (res.code === 1000 || res.code === 200)) {
                         message.success('Đã xóa danh mục');
                         fetchData(currentPage, pageSize);
                    } else { 
                        message.success('Đã xóa danh mục');
                        fetchData(currentPage, pageSize);
                    }
                } catch (error) {
                    message.error('Xóa thất bại! Có thể danh mục đang chứa sản phẩm.');
                }
            }
        });
    }, [currentPage, pageSize, fetchData]);

    return {
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
    };
};
