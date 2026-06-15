import React, { useState } from 'react';
import { Typography, message, Form, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import cartApi from '../../api/cartApi';
import orderApi from '../../api/orderApi';
import paymentApi from '../../api/paymentApi';
import discountApi from '../../api/discountApi';
import { useCart } from '../../context/CartContext';

import CartEmpty from '../../components/cart/CartEmpty';
import CartTable from '../../components/cart/CartTable';
import CartSummary from '../../components/cart/CartSummary';
import CheckoutModal from '../../components/cart/CheckoutModal';

const { Title } = Typography;

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const { cart, setCart, refreshCart, isCartLoading } = useCart(); // Lấy từ Context

    // loading chỉ dùng khi Update/Delete item
    const [loading, _] = useState(false);

    // --- STATE DISCOUNT ---
    const [couponCode, setCouponCode] = useState(''); // Mã đang nhập
    const [appliedCode, setAppliedCode] = useState(''); // Mã đã áp dụng thành công
    const [discountAmount, setDiscountAmount] = useState(0); // Số tiền được giảm
    const [isCheckingCode, setIsCheckingCode] = useState(false);
    const [affectedProductIds, setAffectedProductIds] = useState<number[]>([]); // Các Sản phẩm được discount

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [form] = Form.useForm();
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');

    // Reset discount khi giỏ hàng thay đổi
    const resetDiscount = () => {
        setAppliedCode('');
        setDiscountAmount(0);
        setCouponCode('');
        setAffectedProductIds([]);
    };

    // Xử lý tăng giảm số lượng
    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        try {
            const res = await cartApi.updateItem(itemId, newQuantity);
            if (res && res.code === 1000 && res.result) {
                setCart(res.result);
                refreshCart();
                resetDiscount();
            }
        } catch (error: any) {
            message.error('Lỗi cập nhật');
        }
    };

    // Xử lý xóa item
    const handleDelete = async (itemId: number) => {
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
        }
    };

    // --- LOGIC DISCOUNT ---
    const handleApplyCoupon = async () => {
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
    };

    // --- LOGIC CHECKOUT ---
    const handleCheckoutSubmit = async (values: any) => {
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
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        form.resetFields();
    };

    const finalTotal = cart ? Math.max(0, cart.totalAmount - discountAmount) : 0;

    if (isCartLoading) {
        return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
    }

    if (!cart || cart.items.length === 0) {
        return <CartEmpty />;
    }

    return (
        <div className="animate-fade-up" style={{ padding: '20px 0px 60px 0px', maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ marginBottom: 40, fontWeight: 800, letterSpacing: '-0.5px' }}>Giỏ hàng của bạn</Title>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 40, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>

                    {/* BẢNG DANH SÁCH SẢN PHẨM */}
                    <div style={{ flex: 2, minWidth: 300 }}>
                        <CartTable
                            items={cart.items}
                            loading={loading}
                            affectedProductIds={affectedProductIds}
                            onQuantityChange={handleQuantityChange}
                            onDelete={handleDelete}
                        />
                    </div>

                    {/* TỔNG TIỀN & MÃ GIẢM GIÁ */}
                    <div style={{ flex: 1, minWidth: 350 }}>
                        <CartSummary
                            totalAmount={cart.totalAmount}
                            discountAmount={discountAmount}
                            couponCode={couponCode}
                            appliedCode={appliedCode}
                            isCheckingCode={isCheckingCode}
                            finalTotal={finalTotal}
                            setCouponCode={setCouponCode}
                            handleApplyCoupon={handleApplyCoupon}
                            resetDiscount={resetDiscount}
                            handleOpenModal={handleOpenModal}
                        />
                    </div>
                </div>
            </div>

            {/* MODAL CHECKOUT */}
            <CheckoutModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                form={form}
                handleCheckoutSubmit={handleCheckoutSubmit}
                checkoutLoading={checkoutLoading}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cartTotal={cart.totalAmount}
                discountAmount={discountAmount}
                appliedCode={appliedCode}
                finalTotal={finalTotal}
            />
        </div>
    );
};

export default CartPage;