import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

// 1. Tạo instance với cấu hình mặc định
const axiosClient: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api', // Đảm bảo đúng port Backend
    headers: {
        'Content-Type': 'application/json',
    },
    // timeout: 10000, // (Tùy chọn) Hủy request nếu chờ quá 10s
});

// 2. Xử lý TRƯỚC khi gửi request (Gắn Token)
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Lấy token từ bộ nhớ trình duyệt
        const token = localStorage.getItem('access_token');

        // Nếu có token, gắn vào Header "Authorization"
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Xử lý SAU khi nhận response (Xử lý lỗi & Lấy dữ liệu)
axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Trả về thẳng data (ApiResponse) để đỡ phải gọi .data nhiều lần
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        // Xử lý các lỗi chung
        if (error.response) {
            // Nếu server trả về 401 (Hết hạn login)
            if (error.response.status === 401) {
                // Xóa token và đá về trang login
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }

            // Có thể check thêm lỗi 403 (Forbidden) ở đây
        }

        // Chuyền lỗi về cho file gọi API xử lý tiếp (hiện thông báo)
        return Promise.reject(error);
    }
);

export default axiosClient;