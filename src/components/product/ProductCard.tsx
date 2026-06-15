import React from 'react';
import { Button, Card, Typography } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ProductResponse } from '../../types/backend';
import { useAddToCart } from '../../hooks/useAddToCart';

const { Text } = Typography;

interface ProductCardProps {
    product: ProductResponse;
    delayIndex?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, delayIndex }) => {
    const navigate = useNavigate();
    const { isAdding, addToCart } = useAddToCart();

    const delayClass = delayIndex !== undefined ? `delay-${(delayIndex % 4 + 1) * 100}` : '';

    return (
        <Card
            className={`premium-card animate-fade-up ${delayClass}`}
            hoverable
            onClick={() => navigate(`/products/${product.id}`)}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' } }}
            cover={
                <div className="card-img-zoom" style={{ height: 260, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-body)' }}>
                    <img
                        alt={product.name}
                        src={product.image}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: 4 / 3 }}
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
        >
            <div style={{ marginBottom: 16 }}>
                <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: 1.4,
                    marginBottom: 8,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>
                    {product.name}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" delete style={{ fontSize: 13 }}>
                        {(product.price * 1.1).toLocaleString()} đ
                    </Text>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)', marginTop: 2 }}>
                        {product.price.toLocaleString()} đ
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                <Button
                    block
                    icon={<EyeOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${product.id}`);
                    }}
                    style={{ borderRadius: 8 }}
                >
                    Xem
                </Button>
                <Button
                    type="primary"
                    block
                    disabled={product.stockQuantity <= 0}
                    loading={isAdding}
                    icon={<ShoppingCartOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id, 1);
                    }}
                    style={{ borderRadius: 8 }}
                >
                    {product.stockQuantity > 0 ? 'Thêm' : 'Hết'}
                </Button>
            </div>
        </Card>
    );
};

export default ProductCard;
