import { useState, useCallback } from 'react';
import { message } from 'antd';
import supplierApi, { type Supplier } from '../../../api/supplierApi';

export const useSupplier = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await supplierApi.getAllSuppliers();
            if (res && res.code === 1000 && res.result) {
                setSuppliers(res.result);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách nhà cung cấp');
        } finally {
            setLoading(false);
        }
    }, []);

    const createSupplier = async (values: Supplier) => {
        try {
            const res = await supplierApi.createSupplier(values);
            if (res && res.code === 1000) {
                message.success('Thêm nhà cung cấp thành công!');
                fetchSuppliers();
                return true;
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Thêm thất bại');
            return false;
        }
        return false;
    };

    return {
        suppliers,
        loading,
        fetchSuppliers,
        createSupplier
    };
};
