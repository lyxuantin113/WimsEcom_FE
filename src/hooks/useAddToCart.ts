import { useState } from "react";
import cartApi from "../api/cartApi";
import { message } from "antd";
import { useAuthState } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export const useAddToCart = () => {
    const { isLoggedIn } = useAuthState();
    const { refreshCart } = useCart();
    const navigate = useNavigate();

    const [isAdding, setIsAdding] = useState(false);

    const addToCart = async (id: number, quantity: number = 1) => {
        setIsAdding(true);
        if (!isLoggedIn) {
            message.warning('Vui lòng đăng nhập để mua hàng!');
            setIsAdding(false);
            navigate('/login');
            return;
        }

        try {
            const res = await cartApi.addToCart(id, quantity);

            if (res && res.code === 1000) {
                message.success("Đã thêm vào giỏ hàng!");
                refreshCart();
            }
        } catch (error) {
            console.error("Xảy ra lỗi khi thêm vào giỏ hàng", error);
            message.error("Lỗi khi thêm vào giỏ hàng");
        } finally {
            setIsAdding(false);
        }
    };

    return { isAdding, addToCart };
};
