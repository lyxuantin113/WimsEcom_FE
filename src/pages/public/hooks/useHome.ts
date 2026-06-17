import { useState, useEffect, useCallback } from 'react';
import productApi from '../../../api/productApi';
import bannerApi from '../../../api/bannerApi';
import categoryApi from '../../../api/categoryApi';
import type { ProductResponse, BannerResponse, CategoryResponse } from '../../../types/backend';

export const useHome = () => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [banners, setBanners] = useState<BannerResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await productApi.getAll({ page: 1, size: 8, sortBy: 'id' });
            if (res && res.code === 1000 && res.result) {
                setProducts(res.result.data);
            }
        } catch (error) {
            console.error('Lỗi tải sản phẩm trang chủ:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBanners = useCallback(async () => {
        try {
            setLoading(true);
            const res = await bannerApi.getActiveBanner();
            if (res && res.code === 1000 && res.result) {
                setBanners(res.result);
            }
        } catch (error) {
            console.error('Lỗi tải banner:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryApi.getAll({ page: 1, size: 20 });
            if (res && res.code === 1000 && res.result) {
                setCategories(res.result.data);
            }
        } catch (error) {
            console.error('Lỗi tải danh mục:', error);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchBanners();
        fetchCategories();
    }, [fetchProducts, fetchBanners, fetchCategories]);

    return {
        products,
        banners,
        categories,
        loading
    };
};
