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
        <div style={{ padding: '0 20px' }}>
            <Carousel autoplay>
                {banners.map(banner => (
                    <div key={banner.id}>
                        {/* Bấm vào ảnh thì nhảy sang link khuyến mãi */}
                        <a onClick={() => navigate(banner.linkUrl)}>
                            <img
                                src={banner.imageUrl}
                                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                                alt="banner"
                            />
                        </a>
                    </div>
                ))}
            </Carousel>

            <Title level={3} style={{ marginBottom: 20, textAlign: 'center' }}>Sản phẩm mới nhất</Title>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
            ) : (
                <Row gutter={[16, 24]}> {/* Khoảng cách giữa các ô: Ngang 16px, Dọc 24px */}
                    {products.map((product) => (
                        <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                hoverable
                                onClick={() => navigate(`/products/${product.id}`)}
                                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                styles={{ body: { flex: 1 } }}
                                cover={
                                    <div style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                                        <img
                                            alt={product.name}
                                            src={product.image}
                                            style={{ width: 'auto', height: '100%', objectFit: 'cover' }} // objectFit: contain giúp ảnh không bị méo
                                            onError={(e) => {
                                                // Nếu ảnh lỗi thì hiện ảnh mặc định
                                                const target = e.currentTarget;

                                                // 1. Ảnh dự phòng (Dùng service khác ổn định hơn)
                                                const fallbackSrc = "https://placehold.co/300x200?text=No+Image";

                                                // 2. CHẶN VÒNG LẶP:
                                                // Nếu cái ảnh hiện tại đã là ảnh fallback rồi mà vẫn lỗi -> Thì thôi, không cứu nữa.
                                                if (target.src === fallbackSrc) {
                                                    target.onerror = null; // Gỡ bỏ sự kiện lỗi để không lặp
                                                    target.style.display = 'none'; // Hoặc ẩn luôn ảnh đi cho đỡ rác
                                                    return;
                                                }

                                                // 3. Nếu chưa phải ảnh fallback -> Thay thế
                                                target.src = fallbackSrc;
                                            }}
                                        />
                                    </div>
                                }
                                actions={[
                                    <div onClick={(e) => {
                                        e.stopPropagation(); // 🟢 Chặn chuyển trang
                                        e.currentTarget.blur();
                                        navigate(`/products/${product.id}`);
                                    }} key="view">
                                        <EyeOutlined /> Xem
                                    </div>,
                                    product.stockQuantity > 0
                                        ? <div
                                            key="cart"
                                            onClick={async (e) => {
                                                e.stopPropagation(); // Chặn sự kiện

                                                // Check Login nhanh
                                                if (!localStorage.getItem('access_token')) {
                                                    message.warning('Vui lòng đăng nhập để mua hàng!');
                                                    navigate('/login');
                                                    return;
                                                }

                                                try {
                                                    // Gọi API thêm 1 sản phẩm
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
                                            <ShoppingCartOutlined /> Thêm
                                        </div>
                                        : <div key="cart" onClick={(e) => {
                                            e.stopPropagation(); // 🟢 Chặn chuyển trang
                                            // Không làm gì cả
                                        }}>
                                            <ShoppingCartOutlined /> Hết hàng
                                        </div>
                                ]}
                            >
                                <Meta
                                    title={<div style={{ whiteSpace: 'normal' }}>{product.name}</div>} // Cho phép tên xuống dòng
                                    description={
                                        <div>
                                            <Text type="secondary" delete style={{ marginRight: 8 }}>
                                                {/* Giả vờ có giá gốc cao hơn 10% */}
                                                {(product.price * 1.1).toLocaleString()} đ
                                            </Text>
                                            <br />
                                            <Text type="danger" strong style={{ fontSize: 16 }}>
                                                {product.price.toLocaleString()} đ
                                            </Text>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default HomePage;