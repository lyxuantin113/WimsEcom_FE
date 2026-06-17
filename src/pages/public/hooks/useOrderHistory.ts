import { useState, useEffect, useCallback } from 'react';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import orderApi from '../../../api/orderApi';
import paymentApi from '../../../api/paymentApi';
import { useAuthState } from '../../../context/AuthContext';
import type { OrderResponse } from '../../../types/backend';

export const useOrderHistory = () => {
    const { isLoggedIn } = useAuthState();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>("ALL");

    const fetchOrders = useCallback(async () => {
        if (!isLoggedIn) {
            message.error("Bạn cần đăng nhập để xem lịch sử đơn hàng");
            navigate('/login');
            return;
        }
        setLoading(true);
        try {
            const res = await orderApi.getMyOrders({ page: 1, size: 100 });
            if (res && res.code === 1000 && res.result) {
                setOrders(res.result.data);
            }
        } catch (error) {
            message.error("Lỗi tải lịch sử đơn hàng");
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleCancel = useCallback((orderId: number) => {
        Modal.confirm({
            title: 'Hủy đơn hàng',
            content: 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này sẽ hoàn lại kho.',
            okText: 'Đồng ý hủy',
            okType: 'danger',
            cancelText: 'Đóng',
            onOk: async () => {
                try {
                    const res = await orderApi.cancelOrder(orderId);
                    if (res && res.code === 1000) {
                        message.success("Đã hủy đơn hàng thành công");
                        fetchOrders();
                    }
                } catch (error: any) {
                    message.error(error.response?.data?.message || "Lỗi hủy đơn");
                }
            }
        });
    }, [fetchOrders]);

    const handlePayAgain = useCallback((orderId: number) => {
        Modal.confirm({
            title: 'Thanh toán lại',
            content: 'Bạn có chắc chắn muốn thanh toán lại đơn hàng này?',
            okText: 'Đồng ý thanh toán lại',
            okType: 'danger',
            cancelText: 'Đóng',
            onOk: async () => {
                try {
                    try {
                        const vnpayRes = await paymentApi.createVNPayUrl(orderId);
                        if (vnpayRes.code === 1000 && vnpayRes.result) {
                            message.success("Đã thanh toán lại đơn hàng thành công");
                            fetchOrders();
                            window.location.href = vnpayRes.result;
                        } else {
                            message.error("Lỗi tạo link thanh toán VNPay");
                        }
                    } catch (err) {
                        message.error("Không thể kết nối cổng thanh toán");
                    }
                } catch (error: any) {
                    message.error(error.response?.data?.message || "Lỗi thanh toán lại");
                }
            }
        });
    }, [fetchOrders]);

    const handleRequestReturn = useCallback((orderId: number) => {
        Modal.confirm({
            title: 'Yêu cầu trả hàng',
            content: 'Bạn có chắc chắn muốn yêu cầu trả hàng này?',
            okText: 'Đồng ý yêu cầu trả hàng',
            okType: 'danger',
            cancelText: 'Đóng',
            onOk: async () => {
                try {
                    const res = await orderApi.requestReturn(orderId);
                    if (res && res.code === 1000) {
                        message.success("Đã yêu cầu trả hàng thành công");
                        fetchOrders();
                    }
                } catch (error: any) {
                    message.error(error.response?.data?.message || "Lỗi yêu cầu trả hàng");
                }
            }
        });
    }, [fetchOrders]);

    const filteredStatusOrders = selectedStatus == "ALL" ? orders : orders.filter(order => order.status === selectedStatus);

    return {
        loading,
        isModalOpen,
        setIsModalOpen,
        selectedOrder,
        setSelectedOrder,
        selectedStatus,
        setSelectedStatus,
        filteredStatusOrders,
        handleCancel,
        handlePayAgain,
        handleRequestReturn
    };
};
