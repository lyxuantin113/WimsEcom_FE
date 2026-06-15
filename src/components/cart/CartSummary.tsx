import React from 'react';
import { Card, Typography, Input, Button, Space, Tag, Divider } from 'antd';
import { ArrowRightOutlined, TagOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface CartSummaryProps {
    totalAmount: number;
    discountAmount: number;
    couponCode: string;
    appliedCode: string;
    isCheckingCode: boolean;
    finalTotal: number;
    setCouponCode: (val: string) => void;
    handleApplyCoupon: () => void;
    resetDiscount: () => void;
    handleOpenModal: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
    totalAmount,
    discountAmount,
    couponCode,
    appliedCode,
    isCheckingCode,
    finalTotal,
    setCouponCode,
    handleApplyCoupon,
    resetDiscount,
    handleOpenModal
}) => {
    return (
        <Card className="premium-card" title={<span style={{ fontSize: 20, fontWeight: 700 }}>Cộng giỏ hàng</span>} bordered={false} styles={{ body: { padding: '24px' } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ fontSize: 16, color: 'var(--text-muted)' }}>Tạm tính:</Text>
                <Text strong style={{ fontSize: 16 }}>{totalAmount?.toLocaleString()} đ</Text>
            </div>

            {/* --- INPUT MÃ GIẢM GIÁ --- */}
            <div style={{ marginBottom: 15 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Input 
                        prefix={<TagOutlined style={{ color: '#aaa' }}/>} 
                        placeholder="Mã giảm giá" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCode} // Disable nếu đã áp dụng
                    />
                    {appliedCode ? (
                        <Button danger icon={<CloseCircleOutlined />} onClick={resetDiscount} />
                    ) : (
                        <Button type="primary" onClick={handleApplyCoupon} loading={isCheckingCode}>
                            Áp dụng
                        </Button>
                    )}
                </div>
                {appliedCode && discountAmount > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', color: '#52c41a' }}>
                        <Space><Tag color="green">{appliedCode}</Tag> đã áp dụng</Space>
                        <span>-{discountAmount.toLocaleString()} đ</span>
                    </div>
                )}
            </div>
            
            <Divider style={{ margin: '20px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, padding: '16px', background: 'var(--color-bg-body)', borderRadius: 8 }}>
                <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Tổng cộng:</Title>
                <Title level={4} type="danger" style={{ margin: 0, fontWeight: 800 }}>
                    {finalTotal.toLocaleString()} đ
                </Title>
            </div>
            
            <Button 
                type="primary" 
                size="large" 
                block 
                className="hover-lift"
                icon={<ArrowRightOutlined />}
                onClick={handleOpenModal}
                style={{ height: 56, fontSize: 16, fontWeight: 600, borderRadius: 28, boxShadow: 'var(--shadow-md)' }}
            >
                TIẾN HÀNH THANH TOÁN
            </Button>
        </Card>
    );
};

export default CartSummary;
