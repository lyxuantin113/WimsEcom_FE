import { useState, useCallback } from 'react';
import { message, Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import cartApi from '../../../api/cartApi';
import orderApi from '../../../api/orderApi';
import paymentApi from '../../../api/paymentApi';
import discountApi from '../../../api/discountApi';
import { useCart } from '../../../context/CartContext';

export const useCartPage = () => {
    const navigate = useNavigate();
    const { cart, setCart, refreshCart, isCartLoading } = useCart();

    const [loading, setLoading] = useState(false);

    const [couponCode, setCouponCode] = useState('');
    const [appliedCode, setAppliedCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isCheckingCode, setIsCheckingCode] = useState(false);
    const [affectedProductIds, setAffectedProductIds] = useState<number[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [form] = Form.useForm();
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');

    const resetDiscount = useCallback(() => {
        setAppliedCode('');
        setDiscountAmount(0);
        setCouponCode('');
        setAffectedProductIds([]);
    }, []);

    const handleQuantityChange = useCallback(async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setLoading(true);
        try {
            const res = await cartApi.updateItem(itemId, newQuantity);
            if (res && res.code === 1000 && res.result) {
                setCart(res.result);
                refreshCart();
                resetDiscount();
            }
        } catch (error: any) {
            message.error('Lỗi cập nhật');
        } finally {
            setLoading(false);
        }
    }, [setCart, refreshCart, resetDiscount]);

    const handleDelete = useCallback(async (itemId: number) => {
        setLoading(true);
        try {
            const res = await cartApi.removeItem(itemId);
            if (res && res.code === 1000 && res.result) {
                setCart(res.result);
                refreshCart();
                resetDiscount();
                message.success('Đã xóa sản phẩm');
            }
        } catch (error) {
            message.error('Lỗi xóa sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [setCart, refreshCart, resetDiscount]);

    const handleApplyCoupon = useCallback(async () => {
        if (!couponCode.trim()) {
            message.warning("Vui lòng nhập mã giảm giá");
            return;
        }
        if (!cart || cart.items.length === 0) return;

        setIsCheckingCode(true);
        try {
            const payload = {
                code: couponCode,
                items: cart.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            const res = await discountApi.calculate(payload);

            if (res.code === 1000 && res.result) {
                const { totalDiscount, affectedProductIds } = res.result;
                setDiscountAmount(totalDiscount);
                setAppliedCode(couponCode);
                setAffectedProductIds(affectedProductIds);
                message.success(`Áp dụng mã thành công! Giảm ${totalDiscount.toLocaleString()}đ`);
            }
        } catch (error: any) {
            setDiscountAmount(0);
            setAppliedCode('');
            message.error(error.response?.data?.message || "Mã giảm giá không hợp lệ");
        } finally {
            setIsCheckingCode(false);
        }
    }, [couponCode, cart]);

    const handleCheckoutSubmit = useCallback(async (values: any) => {
        if (!cart || cart.items.length === 0) return;

        setCheckoutLoading(true);
        try {
            const orderData = {
                customerName: values.customerName,
                phone: values.phone,
                address: values.address,
                items: cart.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                totalAmount: cart.totalAmount,
                paymentMethod: paymentMethod,
                status: paymentMethod === 'VNPAY' ? 'PENDING_PAYMENT' : 'PENDING_CONFIRMATION',
                discountCode: appliedCode || ""
            };

            const createOrderRes = await orderApi.create(orderData);

            if (createOrderRes && createOrderRes.code === 1000 && createOrderRes.result) {
                if (paymentMethod === 'VNPAY') {
                    try {
                        const vnpayRes = await paymentApi.createVNPayUrl(createOrderRes.result.id);
                        if (vnpayRes.code === 1000 && vnpayRes.result) {
                            window.location.href = vnpayRes.result;
                        } else {
                            message.error("Lỗi tạo link thanh toán VNPay");
                        }
                    } catch (err) {
                        message.error("Không thể kết nối cổng thanh toán");
                    }
                } else {
                    message.success('Đặt hàng thành công!');
                    setCart(null);
                    refreshCart();
                    setIsModalOpen(false);
                    navigate('/order-success');
                }
            }
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.message || 'Đặt hàng thất bại');
        } finally {
            setCheckoutLoading(false);
        }
    }, [cart, paymentMethod, appliedCode, navigate, setCart, refreshCart]);

    const handleOpenModal = useCallback(() => {
        setIsModalOpen(true);
        form.resetFields();
    }, [form]);

    const finalTotal = cart ? Math.max(0, cart.totalAmount - discountAmount) : 0;

    return {
        cart,
        isCartLoading,
        loading,
        couponCode,
        setCouponCode,
        appliedCode,
        discountAmount,
        isCheckingCode,
        affectedProductIds,
        isModalOpen,
        setIsModalOpen,
        checkoutLoading,
        form,
        paymentMethod,
        setPaymentMethod,
        finalTotal,
        handleQuantityChange,
        handleDelete,
        handleApplyCoupon,
        resetDiscount,
        handleCheckoutSubmit,
        handleOpenModal
    };
};
