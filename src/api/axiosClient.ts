import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { getToken, setToken } from '../utils/authUtils';

// 1. Tạo instance với cấu hình mặc định
const baseURL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

const axiosClient: AxiosInstance = axios.create({
    baseURL: `${baseURL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Gửi cookie (refreshToken) lên Backend
    // timeout: 10000, // (Tùy chọn) Hủy request nếu chờ quá 10s
});

// 2. Xử lý TRƯỚC khi gửi request (Gắn Token)
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Lấy token từ bộ nhớ (In-memory)
        const token = getToken();

        // Nếu có token, gắn vào Header "Authorization"
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Xử lý SAU khi nhận response (Xử lý lỗi & Lấy dữ liệu)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Trả về thẳng data (ApiResponse) để đỡ phải gọi .data nhiều lần
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Xử lý các lỗi chung
        if (error.response) {
            // Nếu server trả về 401 (Hết hạn login) và không phải request refresh chính nó
            if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((token) => {
                            originalRequest.headers['Authorization'] = 'Bearer ' + token;
                            return axiosClient(originalRequest);
                        })
                        .catch((err) => {
                            return Promise.reject(err);
                        });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    // Gọi API refresh token
                    // Lưu ý: Import inline để tránh circular dependency nếu cần
                    const { default: authApi } = await import('./authApi');
                    // Refresh không cần param vì dùng HttpOnly Cookie
                    const response = await authApi.refreshToken();

                    if (response && response.code === 1000 && response.result) {
                        const newToken = response.result.token;
                        setToken(newToken); // Lưu token mới vào bộ nhớ

                        // Gắn token mới vào header và gửi lại request cũ
                        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        processQueue(null, newToken);
                        return axiosClient(originalRequest);
                    }
                } catch (refreshError: any) {
                    processQueue(refreshError, null);
                    // CHỈ logout nếu thực sự nhận lỗi 401 (Refresh Token hết hạn)
                    if (refreshError.response?.status === 401) {
                        setToken(null);
                        localStorage.removeItem('user_role');
                        localStorage.removeItem('username');
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            // Có thể check thêm lỗi 403 (Forbidden) ở đây
        }

        // Chuyền lỗi về cho file gọi API xử lý tiếp (hiện thông báo)
        return Promise.reject(error);
    }
);

export default axiosClient;