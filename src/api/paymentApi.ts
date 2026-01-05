// src/api/paymentApi.ts
import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/backend";

const paymentApi = {
    createVNPayUrl: (orderId: number): Promise<ApiResponse<string>> => {
        return axiosClient.get('/payment/vnpay', {
            params: {
                orderId: orderId,
            }
        });
    }
};

export default paymentApi;