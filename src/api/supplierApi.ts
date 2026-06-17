import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/backend';

export interface Supplier {
    id?: number;
    name: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
}

const supplierApi = {
    getAllSuppliers(): Promise<ApiResponse<Supplier[]>> {
        return axiosClient.get('/admin/suppliers');
    },

    createSupplier(data: Supplier): Promise<ApiResponse<Supplier>> {
        return axiosClient.post('/admin/suppliers', data);
    }
};

export default supplierApi;
