// Map 1-1 với file LoginRequest.java
export interface LoginRequest {
    username: string;
    password: string;
}

// Map 1-1 với file LoginResponse.java
export interface LoginResponse {
    token: string;
    username: string;
    role: string; // Backend trả về 1 role (String), nếu là List thì sửa thành string[]
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