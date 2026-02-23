import React, { useEffect, useState } from 'react';
import { Typography, Carousel, Spin, Empty } from 'antd';
import productApi from '../../api/productApi';
import type { ProductResponse } from '../../types/backend';
import ProductCard from '../product/ProductCard';

const { Title } = Typography;

interface CategoryProductSectionProps {
    categoryId: number;
    categoryName: string;
}

const CategoryProductSection: React.FC<CategoryProductSectionProps> = ({ categoryId, categoryName }) => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProductsByCat = async () => {
            setLoading(true);
            try {
                // Lấy 8 sản phẩm thuộc danh mục này
                const res = await productApi.getAll({ page: 1, size: 8, categoryId: categoryId });
                if (res && res.code === 1000) {
                    setProducts(res.result.data);
                }
            } catch (error) {
                console.error(`Lỗi tải sản phẩm danh mục ${categoryName}:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsByCat();
    }, [categoryId, categoryName]);

    if (!loading && products.length === 0) return null;

    return (
        <div style={{ marginBottom: 32 }} className="animate-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <div>
                    <Title level={2} style={{ marginBottom: 8, fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                        {categoryName}
                    </Title>
                    <div style={{ width: 60, height: 4, background: 'var(--color-primary)', borderRadius: 2 }} />
                </div>
            </div>

            <Spin spinning={loading}>
                {products.length > 0 ? (
                    <Carousel
                        className="carousel-premium-spacing"
                        dots={false}
                        infinite={products.length > 4}
                        slidesToShow={4}
                        slidesToScroll={1}
                        autoplay
                        autoplaySpeed={3000}
                        responsive={[
                            {
                                breakpoint: 1200,
                                settings: { slidesToShow: 3 }
                            },
                            {
                                breakpoint: 768,
                                settings: { slidesToShow: 2 }
                            },
                            {
                                breakpoint: 480,
                                settings: { slidesToShow: 1 }
                            }
                        ]}
                    >
                        {products.map((product) => (
                            <div key={product.id}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </Carousel>
                ) : (
                    !loading && <Empty description="Thông cảm, chưa có sản phẩm nào!" />
                )}
            </Spin>
        </div>
    );
};

export default CategoryProductSection;
