import axiosClient from "./axiosClient";
import { type LoginRequest, type LoginResponse, type RegisterRequest, type RegisterResponse } from "../types/auth";
import { type ApiResponse } from "../types/backend";

const authApi = {
    // Hàm login nhận vào LoginRequest và trả về Promise chứa ApiResponse<LoginResponse>
    login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        const url = '/auth/login';
        return axiosClient.post(url, data);
    },
    register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
        const url = '/auth/register';
        return axiosClient.post(url, data);
    }
};

export default authApi;