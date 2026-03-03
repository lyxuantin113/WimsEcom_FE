import React from 'react';
import { Card, Typography, message } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import cartApi from '../../api/cartApi';
import type { ProductResponse } from '../../types/backend';

const { Text, Paragraph } = Typography;
const { Meta } = Card;

interface ProductCardProps {
    product: ProductResponse;
    delayIndex?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, delayIndex }) => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const { isLoggedIn } = useAuth();

    const delayClass = delayIndex !== undefined ? `delay-${(delayIndex % 4 + 1) * 100}` : '';

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            message.warning('Vui lòng đăng nhập để mua hàng!');
            navigate('/login');
            return;
        }
        try {
            const res = await cartApi.addToCart(product.id, 1);
            if (res && res.code === 1000) {
                message.success('Đã thêm vào giỏ!');
                refreshCart();
            }
        } catch (error) {
            message.error('Lỗi thêm giỏ hàng');
        }
    };

    return (
        <Card
            className={`premium-card animate-fade-up ${delayClass}`}
            hoverable
            onClick={() => navigate(`/products/${product.id}`)}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, padding: '24px' } }}
            cover={
                <div className="card-img-zoom" style={{ height: 260, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                    <img
                        alt={product.name}
                        src={product.image}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            const target = e.currentTarget;
                            const fallbackSrc = "https://placehold.co/400x400?text=No+Image";
                            if (target.src === fallbackSrc) {
                                target.onerror = null;
                                target.style.display = 'none';
                                return;
                            }
                            target.src = fallbackSrc;
                        }}
                    />
                </div>
            }
            actions={[
                <div className="hover-lift" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/products/${product.id}`);
                }} key="view" style={{ padding: '12px 0' }}>
                    <EyeOutlined style={{ marginRight: 6 }} /> Xem chi tiết
                </div>,
                product.stockQuantity > 0 ? (
                    <div
                        className="hover-lift"
                        key="cart"
                        style={{ padding: '12px 0', color: 'var(--color-primary)', fontWeight: 600 }}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCartOutlined style={{ marginRight: 6, fontSize: 16 }} /> Bỏ vào giỏ
                    </div>
                ) : (
                    <div key="cart" onClick={(e) => e.stopPropagation()} style={{ padding: '12px 0', color: '#ff4d4f', cursor: 'not-allowed' }}>
                        <ShoppingCartOutlined style={{ marginRight: 6 }} /> Hết hàng
                    </div>
                )
            ]}
        >
            <Meta
                title={
                    <Paragraph
                        ellipsis={{ rows: 2, symbol: '...' }}
                        style={{
                            fontSize: 16, fontWeight: 700,
                            lineHeight: 1.4, marginBottom: 8,
                        }}
                    >
                        {product.name}
                    </Paragraph>
                }
                description={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Text type="secondary" delete style={{ fontSize: 13 }}>
                            {(product.price * 1.1).toLocaleString()} đ
                        </Text>
                        <Text strong style={{ fontSize: 16, color: 'var(--color-primary)', display: 'block', marginBottom: 8 }}>
                            {product.price.toLocaleString()} đ
                        </Text>
                        <Paragraph
                            type="secondary"
                            ellipsis={{ rows: 3, symbol: '...' }}
                            style={{ 
                                fontSize: 13, 
                                lineHeight: 1.5,
                                marginBottom: 0 
                            }}
                        >
                            {product.description}
                        </Paragraph>
                    </div>
                }
            />
        </Card>
    );
};

export default ProductCard;
