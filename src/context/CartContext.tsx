import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import cartApi from '../api/cartApi';
import { useAuthState } from './AuthContext';
import type { CartResponse } from '../types/backend';

interface CartContextType {
    totalItems: number;
    cart: CartResponse | null;
    isCartLoading: boolean;
    setCart: React.Dispatch<React.SetStateAction<CartResponse | null>>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [totalItems, setTotalItems] = useState(0);
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [isCartLoading, setIsCartLoading] = useState(true);
    const { isLoggedIn, isAuthLoading } = useAuthState();

    // Hàm lấy dữ liệu giỏ hàng mới nhất
    const refreshCart = async () => {
        if (isAuthLoading) return;

        if (!isLoggedIn) {
            setTotalItems(0);
            setCart(null);
            setIsCartLoading(false);
            return;
        }

        if (!cart) {
            setIsCartLoading(true);
        }
        
        try {
            const res = await cartApi.getMyCart();
            if (res && res.code === 1000 && res.result) {
                setCart(res.result); // Lưu nguyên giỏ hàng vào RAM
                const items = res.result.items || [];
                const total = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                setTotalItems(total);
            }
        } catch (error) {
            console.error("Lỗi tải giỏ hàng", error);
        } finally {
            setIsCartLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthLoading) {
            refreshCart();
        }
    }, [isLoggedIn, isAuthLoading]);

    return (
        <CartContext.Provider value={{ totalItems, cart, isCartLoading, setCart, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart phải được dùng trong CartProvider');
    }
    return context;
};