import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';

interface CartContextType {
    totalItems: number;
    refreshCart: () => void; // Hàm để các trang con gọi khi thêm hàng xong
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [totalItems, setTotalItems] = useState(0);
    const { isLoggedIn, isAuthLoading } = useAuth();

    // Hàm lấy dữ liệu giỏ hàng mới nhất
    const refreshCart = async () => {
        // Nếu đang trong quá trình hồi phục session (silent refresh), chưa fetch vội
        if (isAuthLoading) return;

        // Check token qua context, nếu chưa đăng nhập thì thôi
        if (!isLoggedIn) {
            setTotalItems(0);
            return;
        }

        try {
            const res = await cartApi.getMyCart();
            // @ts-ignore
            if (res && res.code === 1000 && res.result) {
                const items = res.result.items || [];
                // Tính tổng số lượng (Cộng dồn quantity của từng item)
                const total = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                setTotalItems(total);
            }
        } catch (error) {
            console.error("Lỗi tải giỏ hàng", error);
        }
    };

    // Gọi lần đầu khi F5 trang hoặc khi trạng thái login thay đổi
    useEffect(() => {
        if (!isAuthLoading) {
            refreshCart();
        }
    }, [isLoggedIn, isAuthLoading]);

    return (
        <CartContext.Provider value={{ totalItems, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook để dùng nhanh ở các component khác
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart phải được dùng trong CartProvider');
    }
    return context;
};