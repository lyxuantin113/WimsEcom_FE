import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Spin, message, Carousel } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import productApi from '../../api/productApi';
import cartApi from '../../api/cartApi';
import type { ProductResponse, BannerResponse } from '../../types/backend';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import bannerApi from '../../api/bannerApi';

const { Title, Text } = Typography;
const { Meta } = Card;

const HomePage: React.FC = () => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [banners, setBanners] = useState<BannerResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { refreshCart } = useCart();

    // Gọi API lấy sản phẩm (Giống hệt bên Admin nhưng chỉ lấy để xem)
    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Lấy 8 sản phẩm mới nhất để show ra trang chủ
            const res = await productApi.getAll({ page: 1, size: 8, sortBy: 'id' });
            if (res && res.code === 1000) {
                setProducts(res.result.data);
            }
        } catch (error) {
            console.error('Lỗi tải sản phẩm trang chủ:', error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API lấy banner
    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await bannerApi.getActiveBanner();
            if (res && res.code === 1000) {
                setBanners(res.result);
            }
        } catch (error) {
            console.error('Lỗi tải banner:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchBanners();
    }, []);

    return (
        <div style={{ marginBottom: 40, paddingBottom: 20 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                <Carousel autoplay effect="fade">
                    {banners.map(banner => (
                        <div key={banner.id} style={{ position: 'relative' }}>
                            <a onClick={() => navigate(banner.linkUrl)} style={{ display: 'block', position: 'relative' }}>
                                {/* Gradient Overlay to make text pop if added later */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)',
                                    zIndex: 1, pointerEvents: 'none'
                                }} />
                                <img
                                    src={banner.imageUrl}
                                    style={{ width: '100%', height: '500px', objectFit: 'cover' }}
                                    alt="banner"
                                />
                            </a>
                        </div>
                    ))}
                </Carousel>
            </div>

            <div style={{ textAlign: 'center', margin: '60px 0 40px', textTransform: 'capitalize' }} className="animate-fade-up">
                <Title level={2} style={{ marginBottom: 8, fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>
                    Sản phẩm mới nhất
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>Khám phá những xu hướng tiên tiến nhất</Text>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>
            ) : (
                <Row gutter={[24, 32]}>
                    {products.map((product, index) => {
                        const delayClass = `delay-${(index % 4 + 1) * 100}`;
                        
                        return (
                        <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
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
                                        e.currentTarget.blur();
                                        navigate(`/products/${product.id}`);
                                    }} key="view" style={{ padding: '12px 0' }}>
                                        <EyeOutlined style={{ marginRight: 6 }} /> Xem chi tiết
                                    </div>,
                                    product.stockQuantity > 0 ? (
                                        <div
                                            className="hover-lift"
                                            key="cart"
                                            style={{ padding: '12px 0', color: 'var(--color-primary)', fontWeight: 600 }}
                                            onClick={async (e) => {
                                                e.stopPropagation(); 
                                                if (!localStorage.getItem('access_token')) {
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
                                            }}
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
                                        <div style={{ 
                                            whiteSpace: 'normal', fontSize: 16, fontWeight: 700, 
                                            lineHeight: 1.4, marginBottom: 12, display: '-webkit-box', 
                                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
                                        }}>
                                            {product.name}
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <Text type="secondary" delete style={{ marginRight: 8, fontSize: 14 }}>
                                                {(product.price * 1.1).toLocaleString()} đ
                                            </Text>
                                            <Text strong style={{ fontSize: 20, color: 'var(--color-primary)' }}>
                                                {product.price.toLocaleString()} đ
                                            </Text>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    )})}
                </Row>
            )}
        </div>
    );
};

export default HomePage;