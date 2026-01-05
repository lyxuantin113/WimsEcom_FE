import axiosClient from "./axiosClient";
import type { ApiResponse, BannerResponse } from "../types/backend";

const bannerApi = {
    getAll: (): Promise<ApiResponse<BannerResponse[]>> => {
        return axiosClient.get('/banners/admin'); // Gọi API dành cho Admin
    },

    getActiveBanner: (): Promise<ApiResponse<BannerResponse[]>> => {
        return axiosClient.get('/banners'); // Gọi API dành cho Admin
    },

    // Lưu ý: data ở đây phải là FormData
    create: (data: FormData): Promise<ApiResponse<BannerResponse>> => {
        return axiosClient.post('/banners', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    update: (id: number, data: FormData): Promise<ApiResponse<BannerResponse>> => {
        return axiosClient.put(`/banners/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    delete: (id: number): Promise<ApiResponse<string>> => {
        return axiosClient.delete(`/banners/${id}`);
    }
};

export default bannerApi;