import axiosClient from "./axiosClient";
import type { ApiResponse, PageResponse, CategoryResponse, CategoryRequest } from "../types/backend";

const categoryApi = {
    // 1. Lấy danh sách (Có phân trang)
    getAll(params: { page: number; size: number; sortBy?: string }): Promise<ApiResponse<PageResponse<CategoryResponse>>> {
        return axiosClient.get('/categories', { params });
    },

    // 2. Lấy chi tiết (nếu cần sau này)
    getById(id: number): Promise<ApiResponse<CategoryResponse>> {
        return axiosClient.get(`/categories/${id}`);
    },

    // 3. Tạo mới
    create(data: CategoryRequest): Promise<ApiResponse<CategoryResponse>> {
        return axiosClient.post('/categories', data);
    },

    // 4. Cập nhật
    update(id: number, data: CategoryRequest): Promise<ApiResponse<CategoryResponse>> {
        return axiosClient.put(`/categories/${id}`, data);
    },

    // 5. Xóa
    delete(id: number): Promise<ApiResponse<void>> {
        return axiosClient.delete(`/categories/${id}`);
    }
};

export default categoryApi;