import React from 'react';
import { Typography, Spin } from 'antd';
import CartEmpty from './components/CartEmpty';
import CartTable from './components/CartTable';
import CartSummary from './components/CartSummary';
import CheckoutModal from './components/CheckoutModal';
import { useCartPage } from '../hooks/useCartPage';

const { Title } = Typography;

const CartPage: React.FC = () => {
    const {
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
    } = useCartPage();

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