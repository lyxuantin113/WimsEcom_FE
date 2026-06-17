import { useState, useCallback } from 'react';
import { message } from 'antd';
import orderApi from '../../../api/orderApi';
import type { OrderResponse } from '../../../types/backend';

export const useOrder = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await orderApi.getAll({ page: 1, size: 100 }); 
            if (res && res.code === 1000 && res.result) {
                setOrders(res.result.data);
            }
        } catch (error) {
            message.error("Lỗi tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleOpenModal = useCallback((record: OrderResponse) => {
        setSelectedOrder(record);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleUpdateStatus = useCallback(async (newStatus: string) => {
        if (!selectedOrder) return;
        setUpdatingStatus(true);
        try {
            const res = await orderApi.updateStatus(selectedOrder.id, newStatus);
            if (res && res.code === 1000) {
                message.success(`Đã cập nhật trạng thái đơn #${selectedOrder.id} thành ${newStatus}`);
                fetchOrders();
                setIsModalOpen(false);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Lỗi cập nhật trạng thái");
        } finally {
            setUpdatingStatus(false);
        }
    }, [selectedOrder, fetchOrders]);

    return {
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
    };
};
