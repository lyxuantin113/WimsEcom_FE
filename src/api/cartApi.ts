import axiosClient from "./axiosClient";
import type { ApiResponse, CartResponse, } from "../types/backend";

const cartApi = {
    // Lấy giỏ hàng
    getMyCart(): Promise<ApiResponse<CartResponse>> {
        return axiosClient.get('/cart') as any;
    },

    // Thêm vào giỏ
    addToCart(productId: number, quantity: number): Promise<ApiResponse<CartResponse>> {
        // Backend đang dùng CartItemRequest (bạn check lại body JSON cần gì nhé)
        // Thông thường là: { "productId": 1, "quantity": 1 }
        return axiosClient.post('/cart', { productId, quantity }) as any;
    },

    updateItem(itemId: number, quantity: number): Promise<ApiResponse<CartResponse>> {
        // Gửi quantity vào body
        return axiosClient.put(`/cart/items/${itemId}`, { quantity }) as any;
    },

    removeItem(itemId: number): Promise<ApiResponse<CartResponse>> {
        return axiosClient.delete(`/cart/items/${itemId}`) as any;
    }
};

export default cartApi;