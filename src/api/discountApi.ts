import type { ApiResponse, Discount, CartItemRequest } from "../types/backend";
import axiosClient from "./axiosClient";

const discountApi = {
    // Admin: Lấy danh sách
    getAll: (): Promise<ApiResponse<Discount[]>> => {
        return axiosClient.get('/discounts/admin'); // Bạn cần tạo API này ở BE hoặc dùng /discounts nếu đã permit
    },
    // Admin: Tạo mới
    create: (data: any): Promise<ApiResponse<Discount>> => {
        return axiosClient.post('/discounts', data);
    },
    // Admin: Cập nhật
    update: (id: number, data: any): Promise<ApiResponse<Discount>> => {
        return axiosClient.put(`/discounts/${id}`, data);
    },
    // Admin: Xóa
    delete: (id: number): Promise<ApiResponse<string>> => {
        return axiosClient.delete(`/discounts/${id}`);
    },
    // User: Tính toán giảm giá
    calculate: (data: { code: string; items: CartItemRequest[] }): Promise<ApiResponse<number>> => {
        return axiosClient.post('/discounts/calculate', data);
    }
};

export default discountApi;