import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse } from '../types/backend';
import type { Supplier } from './supplierApi';

export interface ProcurementItemRequest {
    productId: number;
    quantity:  number;
    unitPrice: number;
}

export interface ProcurementRequest {
    supplierId: number;
    note: string;
    items: ProcurementItemRequest[];
}

export interface ProcurementItemResponse {
    id: number;
    productId: number;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
}

export interface ProcurementResponse {
    id: number;
    supplier: Supplier;
    status: 'DRAFT' | 'APPROVED';
    totalAmount: number;
    note: string;
    approvedAt: string | null;
    approvedByUsername: string | null;
    createdAt: string;
    updatedAt: string;
    items?: ProcurementItemResponse[];
}

const procurementApi = {
    getAllProcurements(page: number = 1, size: number = 10): Promise<ApiResponse<PageResponse<ProcurementResponse>>> {
        return axiosClient.get(`/admin/procurements?page=${page}&size=${size}`);
    },

    getProcurementById(id: number): Promise<ApiResponse<ProcurementResponse>> {
        return axiosClient.get(`/admin/procurements/${id}`);
    },

    createDraftProcurement(data: ProcurementRequest): Promise<ApiResponse<ProcurementResponse>> {
        return axiosClient.post('/admin/procurements', data);
    },

    approveProcurement(id: number): Promise<ApiResponse<string>> {
        return axiosClient.post(`/admin/procurements/${id}/approve`);
    }
};

export default procurementApi;
