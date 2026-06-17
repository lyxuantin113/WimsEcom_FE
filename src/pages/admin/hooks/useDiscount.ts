import { useState, useCallback } from 'react';
import { message, Form } from 'antd';
import dayjs from 'dayjs';
import discountApi from '../../../api/discountApi';
import type { Discount } from '../../../types/backend';

export const useDiscount = () => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    const [form] = Form.useForm();

    const fetchDiscounts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await discountApi.getAll();
            if (res.code === 1000 && res.result) setDiscounts(res.result);
        } catch (error) {
            message.error("Lỗi tải danh sách mã giảm giá");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleOpenModal = useCallback((record?: Discount) => {
        if (record) {
            setEditingDiscount(record);
            form.setFieldsValue({
                ...record,
                dateRange: [dayjs(record.startDate), dayjs(record.endDate)], 
            });
        } else {
            setEditingDiscount(null);
            form.resetFields();
            form.setFieldsValue({
                active: true,
                scope: 'GLOBAL',
                type: 'PERCENTAGE',
                usageLimit: 100
            });
        }
        setIsModalOpen(true);
    }, [form]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleFinish = useCallback(async (values: any) => {
        try {
            const payload = {
                ...values,
                startDate: values.dateRange[0].toISOString(),
                endDate: values.dateRange[1].toISOString(),
                applicableIds: values.scope === 'GLOBAL' ? null : values.applicableIds
            };

            let res;
            if (editingDiscount) {
                res = await discountApi.update(editingDiscount.id, payload);
            } else {
                res = await discountApi.create(payload);
            }

            if (res && res.code === 1000) {
                message.success(editingDiscount ? "Cập nhật thành công" : "Tạo mã thành công");
                setIsModalOpen(false);
                fetchDiscounts();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    }, [editingDiscount, fetchDiscounts]);

    const handleDelete = useCallback(async (id: number) => {
        try {
            await discountApi.delete(id);
            message.success("Đã xóa mã giảm giá");
            fetchDiscounts();
        } catch (error) {
            message.error("Xóa thất bại");
        }
    }, [fetchDiscounts]);

    return {
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
    };
};
