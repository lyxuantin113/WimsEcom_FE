import axiosClient from "./axiosClient";
import type { ApiResponse, PageResponse, ProductResponse } from "../types/backend";

const productApi = {
    // Hàm lấy danh sách có phân trang
    // params: { page: 1, size: 10, ... }
    getAll(params: any): Promise<ApiResponse<PageResponse<ProductResponse>>> {
        const url = '/products';
        // Axios tự động biến object params thành query string: /products?page=1&size=10
        return axiosClient.get(url, { params });
    },

    // Hàm lấy chi tiết (dùng sau)
    getById(id: number): Promise<ApiResponse<ProductResponse>> {
        const url = `/products/${id}`;
        return axiosClient.get(url);
    },

    getSearchHistory(): Promise<ApiResponse<string[]>> {
        return axiosClient.get('/products/search-history');
    },

    deleteSearchHistory(keyword: string): Promise<ApiResponse<void>> {
        return axiosClient.delete('/products/search-history', {
            params: { keyword }
        });
    },

    // Hàm tạo mới (Dùng FormData để gửi cả File + Text)
    create(data: FormData): Promise<ApiResponse<any>> {
        return axiosClient.post('/products', data, {
            headers: {
                'Content-Type': 'multipart/form-data', // Bắt buộc dòng này để Backend hiểu
            },
        });
    },

    // Hàm cập nhật (Cần ID và FormData)
    update(id: number, data: FormData): Promise<ApiResponse<any>> {
        return axiosClient.put(`/products/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Hàm xóa
    delete(id: number): Promise<ApiResponse<void>> {
        return axiosClient.delete(`/products/${id}`);
    },

    // Hàm lấy sản phẩm liên quan
    getRelated(id: number): Promise<ApiResponse<ProductResponse[]>> {
        return axiosClient.get(`/products/${id}/related`) as any;
    }
};

export default productApi;