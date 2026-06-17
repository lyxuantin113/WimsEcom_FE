import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import productApi from '../../../api/productApi';
import type { ProductResponse } from '../../../types/backend';
import { useAddToCart } from '../../../hooks/useAddToCart';

export const useProductDetail = (id: string | undefined) => {
    const navigate = useNavigate();
    const { isAdding, addToCart } = useAddToCart();

    const [product, setProduct] = useState<ProductResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState<ProductResponse[]>([]);

    const fetchRelated = useCallback(async (productId: number) => {
        try {
            const res = await productApi.getRelated(productId);
            if (res && res.code === 1000 && res.result) {
                setRelatedProducts(res.result);
            }
        } catch (e) {
            console.error("Lỗi lấy related products", e);
        }
    }, []);

    useEffect(() => {
        const fetchProductData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const res = await productApi.getById(Number(id));
                if (res && res.code === 1000 && res.result) {
                    setProduct(res.result);
                    fetchRelated(Number(id));
                } else {
                    message.error('Không tìm thấy sản phẩm!');
                    navigate('/');
                }
            } catch (error) {
                message.error('Lỗi kết nối!');
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
        setQuantity(1);
        window.scrollTo(0, 0);
    }, [id, navigate, fetchRelated]);

    return {
        product,
        loading,
        quantity,
        setQuantity,
        relatedProducts,
        isAdding,
        addToCart,
        navigate
    };
};
