import React, { useEffect, useState } from 'react';
import {
    Row, Col, Card, Typography, Slider, Button,
    Pagination, Select, Spin, Empty, Space, Divider,
    message
} from 'antd';
import { FilterOutlined, ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import type { ProductResponse, CategoryResponse } from '../../types/backend';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import cartApi from '../../api/cartApi';
import SearchHistoryInput from '../../components/SearchHistoryInput';

const { Title, Text } = Typography;
const { Option } = Select;

const ClientProductPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const { isLoggedIn } = useAuth();

    // --- STATE ---
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // Bộ lọc
    const [filter, setFilter] = useState({
        page: 1,
        size: 12, // User thường xem nhiều hơn Admin (grid 3x4 hoặc 4x3)
        sortBy: 'createdAt',
        keyword: '',
        categoryId: null as number | null,
        minPrice: undefined as number | undefined,
        maxPrice: undefined as number | undefined,
    });

    // State riêng cho Slider giá (để mượt UI, thả chuột mới call API)
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999999]);

    // --- FETCH DATA ---

    // 1. Load danh mục (chạy 1 lần)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryApi.getAll({ page: 1, size: 100 });
                if (res.code === 1000 && res.result) setCategories(res.result.data);
            } catch (err) { console.error(err); }
        };
        fetchCategories();
    }, []);

    // 2. Load sản phẩm (chạy khi filter đổi)
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await productApi.getAll(filter);
                if (res.code === 1000 && res.result) {
                    setProducts(res.result.data);
                    setTotal(res.result.totalElements);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchProducts();
    }, [filter]);

    // Hàm format tiền tệ
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    return (
        <div className="animate-fade-up" style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px 80px' }}>
            {/* Header đơn giản */}
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
                <Title level={1} style={{ fontWeight: 800, fontSize: 40, letterSpacing: '-1px', marginBottom: 8 }}>
                    Cửa Hàng
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>Khám phá bộ sưu tập sản phẩm mới nhất của chúng tôi</Text>
            </div>

            <Row gutter={[32, 32]}>
                {/* === SIDEBAR (BÊN TRÁI) === */}
                <Col xs={24} lg={6}>
                    <Card 
                        className="premium-card" 
                        title={<span style={{ fontWeight: 700 }}><FilterOutlined style={{ marginRight: 8 }} /> Bộ lọc</span>}
                        style={{ position: 'sticky', top: 100, borderRadius: 16 }}
                        styles={{ body: { padding: '24px' } }}
                    >
                        {/* 1. Tìm kiếm từ khóa */}
                        <div style={{ marginBottom: 32 }}>
                            <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>Tìm kiếm</Text>
                            <SearchHistoryInput
                                initialValue={filter.keyword}
                                onSearch={(val) => {
                                    setFilter({ ...filter, keyword: val, page: 1 });
                                }}
                            />
                        </div>

                        <Divider style={{ margin: '24px 0' }} />

                        {/* 2. Danh mục */}
                        <div style={{ marginBottom: 32 }}>
                            <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>Danh mục</Text>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <Text
                                    className="hover-lift"
                                    style={{ 
                                        cursor: 'pointer', 
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        background: filter.categoryId === null ? 'var(--color-bg-body)' : 'transparent',
                                        color: filter.categoryId === null ? 'var(--color-primary)' : 'var(--text-muted)', 
                                        fontWeight: filter.categoryId === null ? 700 : 500,
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => setFilter({ ...filter, categoryId: null, page: 1 })}
                                >
                                    Tất cả sản phẩm
                                </Text>
                                {categories.map(cat => (
                                    <Text
                                        key={cat.id}
                                        className="hover-lift"
                                        style={{ 
                                            cursor: 'pointer', 
                                            padding: '8px 12px',
                                            borderRadius: 8,
                                            background: filter.categoryId === cat.id ? 'var(--color-bg-body)' : 'transparent',
                                            color: filter.categoryId === cat.id ? 'var(--color-primary)' : 'var(--text-muted)', 
                                            fontWeight: filter.categoryId === cat.id ? 700 : 500,
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={() => setFilter({ ...filter, categoryId: cat.id, page: 1 })}
                                    >
                                        {cat.name}
                                    </Text>
                                ))}
                            </div>
                        </div>

                        <Divider style={{ margin: '24px 0' }} />

                        {/* 3. Khoảng giá */}
                        <div style={{ marginBottom: 32 }}>
                            <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>Khoảng giá</Text>
                            <Slider
                                range
                                min={0}
                                max={50000000} // Max giá thực tế hơn
                                step={500000}
                                value={priceRange}
                                onChange={(val) => setPriceRange(val as [number, number])}
                                onChangeComplete={(val) => setFilter({ ...filter, minPrice: val[0], maxPrice: val[1], page: 1 })}
                                styles={{
                                    track: { background: 'var(--color-primary)' },
                                    handle: { borderColor: 'var(--color-primary)', background: '#fff' }
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8, color: 'var(--text-muted)' }}>
                                <span>{formatCurrency(priceRange[0])}</span>
                                <span>{formatCurrency(priceRange[1])}</span>
                            </div>
                        </div>

                        <Button 
                            block 
                            danger
                            type="text"
                            onClick={() => {
                                setFilter({
                                    page: 1, size: 12, sortBy: 'createdAt',
                                    keyword: '', categoryId: null,
                                    minPrice: undefined, maxPrice: undefined
                                });
                                setPriceRange([0, 50000000]);
                            }}
                            style={{ fontWeight: 600, marginTop: 12 }}
                        >
                            Xóa tất cả bộ lọc
                        </Button>
                    </Card>
                </Col>

                {/* === DANH SÁCH SẢN PHẨM (BÊN PHẢI) === */}
                <Col xs={24} lg={18}>
                    {/* Header sắp xếp */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        flexWrap: 'wrap', // CHỐNG ÉP TEXT TRÊN MOBILE
                        gap: 16,
                        marginBottom: 32, 
                        background: '#fff', 
                        padding: '16px 24px', 
                        borderRadius: 16,
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <Text style={{ fontSize: 15 }}>Tìm thấy <strong style={{color: 'var(--color-primary)'}}>{total}</strong> sản phẩm</Text>
                        <Space size="large" style={{ flexWrap: 'wrap' }}>
                            <Text style={{ fontWeight: 500 }}>Sắp xếp theo:</Text>
                            <Select
                                value={filter.sortBy}
                                style={{ width: 160 }}
                                variant="borderless"
                                onChange={(val) => setFilter({ ...filter, sortBy: val })}
                                dropdownStyle={{ borderRadius: 8 }}
                            >
                                <Option value="createdAt">Mới nhất</Option>
                                <Option value="price">Giá từ thấp đến cao</Option>
                                <Option value="price,desc">Giá từ cao đến thấp</Option>
                            </Select>
                        </Space>
                    </div>

                    {/* Grid Sản phẩm */}
                    <Spin spinning={loading} size="large">
                        {products.length === 0 ? (
                            <div style={{ padding: '80px 0', textAlign: 'center' }}>
                                <Empty description={<Text type="secondary" style={{fontSize: 16}}>Không tìm thấy sản phẩm nào phù hợp với bộ lọc</Text>} />
                            </div>
                        ) : (
                            <Row gutter={[24, 32]}>
                                {products.map((product, index) => {
                                    const delayClass = `delay-${(index % 4 + 1) * 100}`;
                                    return (
                                    <Col xs={12} sm={12} md={8} lg={8} key={product.id}>
                                        <Card
                                            className={`premium-card animate-fade-up ${delayClass}`}
                                            hoverable
                                            onClick={() => navigate(`/products/${product.id}`)}
                                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                            styles={{ body: { flex: 1, padding: '20px' } }}
                                            cover={
                                                <div className="card-img-zoom" style={{ height: 260, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-body)' }}>
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
                                                    minHeight: '44px'
                                                }}>
                                                    {product.name}
                                                </div>
                                                <Text type="secondary" delete style={{ fontSize: 13 }}>
                                                    {(product.price * 1.1).toLocaleString()} đ
                                                </Text>
                                                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)', marginTop: 2 }}>
                                                    {product.price.toLocaleString()} đ
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
                                                    icon={<ShoppingCartOutlined />}
                                                    onClick={async (e) => {
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
                                                    }}
                                                    style={{ borderRadius: 8 }}
                                                >
                                                    {product.stockQuantity > 0 ? 'Thêm' : 'Hết'}
                                                </Button>
                                            </div>
                                        </Card>
                                    </Col>
                                )})}
                            </Row>
                        )}
                    </Spin>

                    {/* Phân trang */}
                    <div style={{ marginTop: 60, textAlign: 'center' }}>
                        <Pagination
                            current={filter.page}
                            pageSize={filter.size}
                            total={total}
                            onChange={(page, pageSize) => setFilter({ ...filter, page, size: pageSize })}
                            showSizeChanger
                            style={{ padding: '16px', borderRadius: 8, background: '#fff', boxShadow: 'var(--shadow-sm)', display: 'inline-flex' }}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ClientProductPage;