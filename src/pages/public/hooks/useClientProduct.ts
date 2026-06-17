import { useState, useEffect, useCallback } from 'react';
import productApi from '../../../api/productApi';
import categoryApi from '../../../api/categoryApi';
import type { ProductResponse, CategoryResponse } from '../../../types/backend';

export const useClientProduct = () => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const [filter, setFilter] = useState({
        page: 1,
        size: 12,
        sortBy: 'createdAt',
        keyword: '',
        categoryId: null as number | null,
        minPrice: undefined as number | undefined,
        maxPrice: undefined as number | undefined,
    });

    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryApi.getAll({ page: 1, size: 100 });
                if (res && res.code === 1000 && res.result) {
                    setCategories(res.result.data);
                }
            } catch (err) { console.error(err); }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await productApi.getAll(filter);
                if (res.code === 1000 && res.result) {
                    setProducts(res.result.data);
                    setTotal(res.result.totalElements);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchProducts();
    }, [filter]);

    const formatCurrency = useCallback((amount: number) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }, []);

    const resetFilters = useCallback(() => {
        setFilter({
            page: 1, size: 12, sortBy: 'createdAt',
            keyword: '', categoryId: null,
            minPrice: undefined, maxPrice: undefined
        });
        setPriceRange([0, 50000000]);
    }, []);

    return {
        products,
        categories,
        loading,
        total,
        filter,
        setFilter,
        priceRange,
        setPriceRange,
        formatCurrency,
        resetFilters
    };
};
