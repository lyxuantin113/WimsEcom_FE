import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse } from '../types/backend';

export interface InventoryTransactionResponse {
    id: number;
    productId: number;
    productCode: string;
    productName: string;
    quantity: number;
    transactionType: 'IMPORT' | 'EXPORT' | 'RETURN';
    referenceId: number | null;
    note: string;
    createdAt: string;
}

export interface InventoryTransactionParams {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
    keyword?: string;
}

const inventoryApi = {
    getAllTransactions(params: InventoryTransactionParams = { page: 1, size: 10 }): Promise<ApiResponse<PageResponse<InventoryTransactionResponse>>> {
        return axiosClient.get('/admin/inventory/transactions', { params });
    }
};

export default inventoryApi;
