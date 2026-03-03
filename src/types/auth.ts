// Map 1-1 với file LoginRequest.java
export interface LoginRequest {
    username: string;
    password: string;
}

// Map 1-1 với file LoginResponse.java (Mới: Không có refreshToken trong Body)
export interface LoginResponse {
    token: string;
    username: string;
    role: string;
}

// Map 1-1 với file TokenResponse.java (Dùng nội bộ khi refresh/login trong BE)
export interface TokenResponse {
    accessToken: string;
    refreshToken: string; // Thực tế FE không dùng cái này từ Body nữa nhưng để map đủ cấu trúc Record BE
    username: string;
    role: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    fullname: string;
}

export interface RegisterResponse {
    username: string;
    email: string;
    fullname: string;
}