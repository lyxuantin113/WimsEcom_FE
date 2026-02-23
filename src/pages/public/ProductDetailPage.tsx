import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Thêm Card vào import
import { Row, Col, Image, Typography, Button, InputNumber, Divider, Space, message, Spin, Tag, Card } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import productApi from '../../api/productApi';
import type { ProductResponse } from '../../types/backend';
import cartApi from '../../api/cartApi';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/product/ProductCard';

const { Title, Text, Paragraph } = Typography;

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState<ProductResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    
    // State cho sản phẩm liên quan
    const [relatedProducts, setRelatedProducts] = useState<ProductResponse[]>([]);

    const { refreshCart } = useCart();

    useEffect(() => {
        const fetchProductData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // 1. Lấy chi tiết sản phẩm
                const res = await productApi.getById(Number(id));
                if (res && res.code === 1000) {
                    setProduct(res.result);
                    
                    // 2. Sau khi lấy xong sản phẩm chính -> Lấy sản phẩm liên quan luôn
                    // (Gọi lồng nhau hoặc Promise.all đều được, ở đây gọi sau để chắc chắn ID tồn tại)
                    fetchRelated(Number(id));
                } else {
                    message.error('Không tìm thấy sản phẩm!');
                    navigate('/');
                }
            } catch (error) {
                message.error('Lỗi kết nối!');
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
        // Reset lại số lượng khi đổi sản phẩm
        setQuantity(1);
        // Scroll lên đầu trang khi chuyển trang
        window.scrollTo(0, 0); 
    }, [id, navigate]);

    // Hàm lấy related tách riêng cho gọn
    const fetchRelated = async (productId: number) => {
        try {
            const res = await productApi.getRelated(productId);
            if (res && res.code === 1000) {
                setRelatedProducts(res.result);
            }
        } catch (e) {
            console.error("Lỗi lấy related products", e);
        }
    }

    const handleAddToCart = async () => {
        // Check 1: Phải đăng nhập mới được mua
        const token = localStorage.getItem('access_token');
        if (!token) {
            message.warning('Vui lòng đăng nhập để mua hàng!');
            navigate('/login');
            return;
        }

        try {
            setLoading(true); // Tận dụng biến loading hoặc tạo biến addingToCart riêng nếu muốn
            
            if (!product) return;

            // Gọi API
            const res = await cartApi.addToCart(product.id, quantity);
            if (res && res.code === 1000) {
                message.success(`Đã thêm ${quantity} sản phẩm vào giỏ!`);
                
                // 🟢 GỌI HÀM NÀY ĐỂ HEADER CẬP NHẬT
                refreshCart(); 
            } else {    
                message.error(res.message || 'Thêm thất bại');
            }
        } catch (error) {
            message.error('Lỗi khi thêm vào giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
    if (!product) return null;

    const isInStock = product.stockQuantity > 0;

    return (
        <div className="animate-fade-up" style={{ padding: '20px 20px 80px 20px', maxWidth: 1200, margin: '0 auto' }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 8, fontSize: 16, fontWeight: 500, color: 'var(--text-muted)' }}>
                Quay lại
            </Button>

            {/* --- PHẦN CHI TIẾT SẢN PHẨM --- */}
            <Card className="premium-card" style={{ marginBottom: 60, borderRadius: 16, overflow: 'hidden' }} styles={{ body: { padding: '32px' } }}>
                <Row gutter={[50, 40]}>
                    <Col xs={24} md={11}>
                        <div className="card-img-zoom" style={{ borderRadius: 16, overflow: 'hidden', padding: 40, background: 'var(--color-bg-body)', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                            <Image
                                src={product.image}
                                alt={product.name}
                                style={{ width: '100%', objectFit: 'contain', maxHeight: 400 }}
                                fallback="https://placehold.co/500x500?text=No+Image"
                            />
                        </div>
                    </Col>
                    <Col xs={24} md={13}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                            <div>
                                <Tag color="blue" style={{ marginBottom: 16, padding: '4px 12px', fontSize: 14, borderRadius: 6, fontWeight: 500 }}>
                                    {product.categoryName}
                                </Tag>
                                <Title level={2} style={{ marginTop: 0, fontWeight: 800, fontSize: 32, letterSpacing: '-0.5px' }}>
                                    {product.name}
                                </Title>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24 }}>
                                    <Title level={2} style={{ color: 'var(--color-primary)', margin: 0, fontWeight: 700 }}>
                                        {product.price.toLocaleString()} đ
                                    </Title>
                                    <Text type="secondary" delete style={{ fontSize: 18 }}>
                                        {(product.price * 1.1).toLocaleString()} đ
                                    </Text>
                                </div>
                                <div style={{ marginBottom: 24 }}>
                                    {isInStock ? 
                                        <Tag icon={<CheckCircleOutlined />} color="success" style={{ padding: '4px 12px', fontSize: 14, borderRadius: 6 }}>Còn hàng ({product.stockQuantity})</Tag> : 
                                        <Tag icon={<CloseCircleOutlined />} color="error" style={{ padding: '4px 12px', fontSize: 14, borderRadius: 6 }}>Hết hàng</Tag>
                                    }
                                </div>
                            </div>
                            
                            <Divider style={{ margin: '24px 0' }} />
                            
                            <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: 32 }}>
                                {product.description || "Sản phẩm hiện chưa có mô tả chi tiết. Chúng tôi sẽ cập nhật trong thời gian sớm nhất."}
                            </Paragraph>
                            
                            <div style={{ marginTop: 'auto', background: 'var(--color-bg-body)', padding: 24, borderRadius: 12 }}>
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <Space size="middle" align="center">
                                        <Text strong style={{ fontSize: 16 }}>Số lượng:</Text>
                                        <InputNumber size="large" min={1} max={product.stockQuantity} value={quantity} onChange={(val) => setQuantity(val || 1)} disabled={!isInStock} style={{ width: 100, borderRadius: 8 }}/>
                                    </Space>
                                    <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={handleAddToCart} disabled={!isInStock} style={{ width: '100%', height: 50, fontSize: 16, fontWeight: 600, borderRadius: 8, boxShadow: 'var(--shadow-md)' }}>
                                        Thêm vào giỏ hàng
                                    </Button>
                                </Space>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* --- PHẦN SẢN PHẨM LIÊN QUAN --- */}
            {relatedProducts.length > 0 && (
                <div style={{ marginTop: 80 }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }} className="animate-fade-up">
                        <Title level={3} style={{ fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Sản phẩm liên quan</Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>Có thể bạn cũng sẽ thích những sản phẩm này</Text>
                    </div>
                    
                    <Row gutter={[24, 32]}>
                        {relatedProducts.map((item, index) => (
                            <Col xs={24} sm={12} md={6} key={item.id}>
                                <ProductCard product={item} delayIndex={index} />
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;