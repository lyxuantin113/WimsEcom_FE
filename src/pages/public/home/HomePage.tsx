import React from 'react';
import { Col, Row, Typography, Spin } from 'antd';
import WelcomeBanner from '../../../components/home/WelcomeBanner';
import ProductCard from '../../../components/product/ProductCard';
import CategoryProductSection from '../../../components/home/CategoryProductSection';
import MarqueeBanner from '../../../components/home/MarqueeBanner';
import BannerGallery from '../../../components/home/BannerGallery';
import { useHome } from '../hooks/useHome';

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
    const { products, banners, categories, loading } = useHome();

    return (
        <div style={{ marginBottom: 40, paddingBottom: 20 }}>
            <WelcomeBanner />
            <MarqueeBanner />
            <BannerGallery banners={banners} />

            <div className="container">
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

                <div style={{ marginTop: 100 }}>
                    {categories.map(cat => (
                        <CategoryProductSection key={cat.id} categoryId={cat.id} categoryName={cat.name} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
