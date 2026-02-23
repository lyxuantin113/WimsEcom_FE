import React, { useEffect, useState } from 'react';
import { Col, Row, Typography, Spin, Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi';
import bannerApi from '../../api/bannerApi';
import categoryApi from '../../api/categoryApi';
import WelcomeBanner from '../../components/home/WelcomeBanner';
import type { ProductResponse, BannerResponse, CategoryResponse } from '../../types/backend';
import ProductCard from '../../components/product/ProductCard';
import CategoryProductSection from '../../components/home/CategoryProductSection';

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [banners, setBanners] = useState<BannerResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

    // Gọi API lấy danh mục
    const fetchCategories = async () => {
        try {
            const res = await categoryApi.getAll({ page: 1, size: 20 });
            if (res && res.code === 1000) {
                setCategories(res.result.data);
            }
        } catch (error) {
            console.error('Lỗi tải danh mục:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchBanners();
        fetchCategories();
    }, []);

    return (
        <div style={{ marginBottom: 40, paddingBottom: 20 }}>
            <WelcomeBanner />
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
                    {products.map((product, index) => (
                        <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                            <ProductCard product={product} delayIndex={index} />
                        </Col>
                    ))}
                </Row>
            )}

            {/* Các Section theo danh mục */}
            <div style={{ marginTop: 100 }}>
                {categories.map(cat => (
                    <CategoryProductSection key={cat.id} categoryId={cat.id} categoryName={cat.name} />
                ))}
            </div>
        </div>
    );
};

export default HomePage;