import { useState, useCallback } from 'react';
import { message } from 'antd';
import procurementApi, { type ProcurementResponse, type ProcurementRequest } from '../../../api/procurementApi';
import supplierApi, { type Supplier } from '../../../api/supplierApi';
import productApi from '../../../api/productApi';
import type { ProductResponse } from '../../../types/backend';

export const useProcurement = () => {
    // Table State
    const [procurements, setProcurements] = useState<ProcurementResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Dropdown Data State (for modal)
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<ProductResponse[]>([]);

    // Detail State (for drawer)
    const [selectedProcurement, setSelectedProcurement] = useState<ProcurementResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchProcurements = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const res = await procurementApi.getAllProcurements(page, pageSize);
            if (res && res.code === 1000 && res.result) {
                setProcurements(res.result.data);
                setTotal(res.result.totalElements);
                setCurrentPage(res.result.currentPage);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách phiếu nhập');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDropdownData = useCallback(async () => {
        try {
            const [supRes, prodRes] = await Promise.all([
                supplierApi.getAllSuppliers(),
                productApi.getAll({ page: 1, size: 500 }) // Load all for simple select
            ]);
            
            if (supRes.code === 1000) setSuppliers(supRes.result || []);
            if (prodRes.code === 1000 && prodRes.result) setProducts(prodRes.result.data || []);
        } catch (error) {
            console.error("Lỗi tải dữ liệu select", error);
        }
    }, []);

    const createDraft = async (payload: ProcurementRequest) => {
        try {
            const res = await procurementApi.createDraftProcurement(payload);
            if (res && res.code === 1000) {
                message.success('Tạo phiếu nhập (Nháp) thành công!');
                fetchProcurements(1);
                return true;
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Tạo phiếu thất bại');
            return false;
        }
        return false;
    };

    const approveProcurement = async (id: number) => {
        try {
            const res = await procurementApi.approveProcurement(id);
            if (res && res.code === 1000) {
                message.success('Duyệt phiếu nhập thành công!');
                fetchProcurements(currentPage);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Duyệt thất bại');
        }
    };

    const fetchProcurementDetails = async (id: number) => {
        setDetailLoading(true);
        try {
            const res = await procurementApi.getProcurementById(id);
            if (res && res.code === 1000 && res.result) {
                setSelectedProcurement(res.result);
                return true;
            }
        } catch (error) {
            message.error('Lỗi khi tải chi tiết phiếu nhập');
        } finally {
            setDetailLoading(false);
        }
        return false;
    };

    return {
        // Table Data
        procurements,
        loading,
        total,
        currentPage,
        pageSize,
        fetchProcurements,

        // Dropdown Data
        suppliers,
        products,
        fetchDropdownData,

        // Actions
        createDraft,
        approveProcurement,
        
        // Details
        selectedProcurement,
        detailLoading,
        fetchProcurementDetails,
        setSelectedProcurement
    };
};
