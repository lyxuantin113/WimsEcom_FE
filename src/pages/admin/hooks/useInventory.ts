import { useState, useCallback } from 'react';
import inventoryApi, { type InventoryTransactionResponse } from '../../../api/inventoryApi';
import dayjs from 'dayjs';

export const useInventory = () => {
    const [transactions, setTransactions] = useState<InventoryTransactionResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Filters
    const [dates, setDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
    const [keyword, setKeyword] = useState('');

    const fetchTransactions = useCallback(async (page: number = 1) => {
        setLoading(true);
        try {
            const params: any = { page, size: 10 };
            if (dates && dates[0] && dates[1]) {
                params.startDate = dates[0].toISOString();
                params.endDate = dates[1].toISOString();
            }
            if (keyword) {
                params.keyword = keyword;
            }

            const res = await inventoryApi.getAllTransactions(params);
            if (res && res.code === 1000 && res.result) {
                setTransactions(res.result.data);
                setTotal(res.result.totalElements);
                setCurrentPage(res.result.currentPage);
            }
        } catch (error) {
            console.error('Lỗi khi tải lịch sử kho', error);
        } finally {
            setLoading(false);
        }
    }, [dates, keyword]);

    const handleSearch = useCallback(() => {
        fetchTransactions(1);
    }, [fetchTransactions]);

    return {
        transactions,
        loading,
        total,
        currentPage,
        keyword,
        setKeyword,
        setDates,
        fetchTransactions,
        handleSearch
    };
};
