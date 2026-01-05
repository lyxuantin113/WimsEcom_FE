import type { ApiResponse, PageResponse, OrderResponse, OrderCreationRequest } from "../types/backend";
import axiosClient from "./axiosClient";

const orderApi = {
    getAll: (params: { page: number; size: number; sortBy?: string }): Promise<ApiResponse<PageResponse<OrderResponse>>> => {
        return axiosClient.get('/orders', { params });
    },
    getMyOrders: (params: { page: number; size: number; sortBy?: string }): Promise<ApiResponse<PageResponse<OrderResponse>>> => {
        return axiosClient.get('/orders/my-orders', { params });
    },
    getOrderById: (id: number): Promise<ApiResponse<OrderResponse>> => {
        return axiosClient.get(`/orders/${id}`);
    },
    create: (data: OrderCreationRequest): Promise<ApiResponse<OrderResponse>> => {
        return axiosClient.post('/orders', data);
    },
    // User tự hủy đơn
    cancelOrder: (id: number): Promise<ApiResponse<OrderResponse>> => {
        return axiosClient.put(`/orders/${id}/cancel`) as any;
    },

    // User yêu cầu trả hàng
    requestReturn: (id: number): Promise<ApiResponse<OrderResponse>> => {
        return axiosClient.put(`/orders/${id}/return`) as any;
    },

    // Admin cập nhật trạng thái (Duyệt, Giao, Hoàn thành...)
    updateStatus: (id: number, status: string): Promise<ApiResponse<OrderResponse>> => {
        // Lưu ý: Backend bạn đang để @RequestParam nên dùng params
        return axiosClient.put(`/orders/${id}/status`, null, {
            params: { status }
        }) as any;
    },

    delete: (id: number): Promise<ApiResponse<void>> => {
        return axiosClient.delete(`/orders/${id}`);
    }
}

export default orderApi;