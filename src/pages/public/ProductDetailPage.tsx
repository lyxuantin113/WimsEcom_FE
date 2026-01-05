import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Thêm Card vào import
import { Row, Col, Image, Typography, Button, InputNumber, Divider, Space, message, Spin, Tag, Card } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import productApi from '../../api/productApi';
import type { ProductResponse } from '../../types/backend';
import cartApi from '../../api/cartApi';
import { useCart } from '../../context/CartContext';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card; // Import Meta cho Card

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
        <div style={{ padding: '0px 20px 60px 20px', maxWidth: 1200, margin: '0 auto' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
                Quay lại
            </Button>

            {/* --- PHẦN CHI TIẾT SẢN PHẨM (GIỮ NGUYÊN) --- */}
            <Card style={{ marginBottom: 40 }}>
                <Row gutter={[40, 0]}>
                    <Col xs={24} md={10}>
                        <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden', padding: 20 }}>
                            <Image
                                src={product.image}
                                alt={product.name}
                                style={{ width: '100%', objectFit: 'contain' }}
                                fallback="https://placehold.co/400x400?text=No+Image"
                            />
                        </div>
                    </Col>
                    <Col xs={24} md={14}>
                        <Tag color="blue" style={{ marginBottom: 10 }}>{product.categoryName}</Tag>
                        <Title level={2} style={{ marginTop: 0 }}>{product.name}</Title>
                        <Title level={3} type="danger">{product.price.toLocaleString()} đ</Title>
                        <div style={{ margin: '20px 0' }}>
                            {isInStock ? 
                                <Tag icon={<CheckCircleOutlined />} color="success">Còn hàng ({product.stockQuantity})</Tag> : 
                                <Tag icon={<CloseCircleOutlined />} color="error">Hết hàng</Tag>
                            }
                        </div>
                        <Divider />
                        <Paragraph>{product.description || "Chưa có mô tả."}</Paragraph>
                        <Divider />
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Space>
                                <Text strong>Số lượng:</Text>
                                <InputNumber min={1} max={product.stockQuantity} value={quantity} onChange={(val) => setQuantity(val || 1)} disabled={!isInStock}/>
                            </Space>
                            <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={handleAddToCart} disabled={!isInStock}>
                                Thêm vào giỏ hàng
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* --- PHẦN SẢN PHẨM LIÊN QUAN (MỚI THÊM) --- */}
            {relatedProducts.length > 0 && (
                <div style={{ marginTop: 60 }}>
                    <Title level={3} style={{ marginBottom: 32, textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Sản phẩm liên quan</Title>
                    <Row gutter={[16, 24]}>
                        {relatedProducts.map((item) => (
                            <Col xs={24} sm={12} md={6} key={item.id}>
                                <Card
                                    hoverable
                                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                    styles={{ body: { flex: 1 } }}
                                    cover={
                                        <div style={{ height: 180, padding: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <img 
                                                alt={item.name} 
                                                src={item.image} 
                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    target.onerror = null;
                                                    target.src="https://placehold.co/300x200?text=No+Image";
                                                }}
                                            />
                                        </div>
                                    }
                                    onClick={() => navigate(`/products/${item.id}`)}
                                >
                                    <Meta
                                        title={<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>}
                                        description={
                                            <Text type="danger" strong>{item.price.toLocaleString()} đ</Text>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;