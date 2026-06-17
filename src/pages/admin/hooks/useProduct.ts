import { useState, useCallback } from 'react';
import { message, Form, Modal } from 'antd';
import productApi from '../../../api/productApi';
import categoryApi from '../../../api/categoryApi';
import type { ProductResponse, CategoryResponse } from '../../../types/backend';

export const useProduct = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ProductResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [params, setParams] = useState({
        page: 1,
        size: 5,
        sortBy: 'createdAt',
        keyword: '',
        isOutOfStock: false,
        categoryId: null,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [fileList, setFileList] = useState<any[]>([]); 
    const [form] = Form.useForm();

    const fetchData = useCallback(async (currentParams = params) => {
        try {
            setLoading(true);
            const response = await productApi.getAll(currentParams);
            if (response && response.code === 1000 && response.result) {
                setData(response.result.data);
                setTotal(response.result.totalElements);
            }
        } catch (error) { 
            message.error('Lỗi tải danh sách'); 
        } finally { 
            setLoading(false); 
        }
    }, [params]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryApi.getAll({ page: 1, size: 100 });
            const responseData: any = res.result?.data ? res.result?.data : res;
            if(responseData && responseData.code === 1000 && responseData.result) {
                setCategories(responseData.result.data);
            }
        } catch (e) {}
    }, []);

    const handleOpenModal = useCallback((record?: ProductResponse) => {
        if (record) {
            setEditingProduct(record);
            const selectedCategory = categories.find(cat => cat.name === record.categoryName);

            form.setFieldsValue({
                ...record,
                categoryId: selectedCategory ? selectedCategory.id : null
            });
            setFileList([]); 
        } else {
            setEditingProduct(null);
            form.resetFields();
            setFileList([]);
        }
        setIsModalOpen(true);
    }, [categories, form]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleSubmit = useCallback(async (values: any) => {
        try {
            const formData = new FormData();
            formData.append('code', values.code);
            formData.append('name', values.name);
            formData.append('description', values.description || '');
            formData.append('price', values.price);
            formData.append('stockQuantity', values.stockQuantity);
            
            if (values.categoryId) {
                 formData.append('categoryId', values.categoryId);
            }

            if (fileList.length > 0) {
                formData.append('file', fileList[0].originFileObj);
            }

            setLoading(true);
            let response;
            
            if (editingProduct) {
                response = await productApi.update(editingProduct.id, formData);
            } else {
                response = await productApi.create(formData);
            }

            if (response && response.code === 1000) {
                message.success(editingProduct ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                setIsModalOpen(false);
                fetchData();
            } else {
                message.error(response.message);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    }, [editingProduct, fileList, fetchData]);

    const handleDelete = useCallback((id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
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
    }, [fetchData]);

    return {
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
    };
};
