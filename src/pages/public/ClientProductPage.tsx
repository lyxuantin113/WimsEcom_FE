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
import cartApi from '../../api/cartApi';
import SearchHistoryInput from '../../components/SearchHistoryInput';

const { Title, Text } = Typography;
const { Option } = Select;
const { Meta } = Card;

const ClientProductPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();

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
                if (res.code === 1000) setCategories(res.result.data);
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
                if (res.code === 1000) {
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
        <div style={{ maxWidth: 1200, margin: '20px auto', padding: '0 20px' }}>
            {/* Banner hoặc Breadcrumb nếu muốn */}
            <div style={{ marginBottom: 20 }}>
                <Title level={2}>Tất cả sản phẩm</Title>
            </div>

            <Row gutter={24}>
                {/* === SIDEBAR (BÊN TRÁI) === */}
                <Col xs={24} sm={24} md={6} lg={6}>
                    <Card title={<><FilterOutlined /> Bộ lọc tìm kiếm</>} style={{ height: 'fit-content' }}>

                        {/* 1. Tìm kiếm từ khóa */}
                        <div style={{ marginBottom: 20 }}>
                            <Text strong>Từ khóa</Text>
                            <SearchHistoryInput
                                initialValue={filter.keyword}
                                onSearch={(val) => {
                                    setFilter({ ...filter, keyword: val, page: 1 });
                                }}
                            />
                        </div>
                        <Divider />

                        {/* 2. Danh mục */}
                        <div style={{ marginBottom: 20 }}>
                            <Text strong>Danh mục</Text>
                            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Text
                                    style={{ cursor: 'pointer', color: filter.categoryId === null ? '#1677ff' : 'inherit', fontWeight: filter.categoryId === null ? 'bold' : 'normal' }}
                                    onClick={() => setFilter({ ...filter, categoryId: null, page: 1 })}
                                >
                                    Tất cả
                                </Text>
                                {categories.map(cat => (
                                    <Text
                                        key={cat.id}
                                        style={{ cursor: 'pointer', color: filter.categoryId === cat.id ? '#1677ff' : 'inherit', fontWeight: filter.categoryId === cat.id ? 'bold' : 'normal' }}
                                        onClick={() => setFilter({ ...filter, categoryId: cat.id, page: 1 })}
                                    >
                                        {cat.name}
                                    </Text>
                                ))}
                            </div>
                        </div>
                        <Divider />

                        {/* 3. Khoảng giá */}
                        <div style={{ marginBottom: 20 }}>
                            <Text strong>Khoảng giá</Text>
                            <Slider
                                range
                                min={0}
                                max={99999999} // Max giá cứng hoặc lấy từ API
                                step={100000}
                                value={priceRange}
                                onChange={(val) => setPriceRange(val as [number, number])}
                                onChangeComplete={(val) => setFilter({ ...filter, minPrice: val[0], maxPrice: val[1], page: 1 })}
                                style={{ marginTop: 10 }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                <span>{formatCurrency(priceRange[0])}</span>
                                <span>{formatCurrency(priceRange[1])}</span>
                            </div>
                        </div>

                        {/* Nút Reset */}
                        <Button block onClick={() => {
                            setFilter({
                                page: 1, size: 12, sortBy: 'createdAt',
                                keyword: '', categoryId: null,
                                minPrice: undefined, maxPrice: undefined
                            });
                            setPriceRange([0, 99999999]);
                        }}>
                            Xóa bộ lọc
                        </Button>
                    </Card>
                </Col>

                {/* === DANH SÁCH SẢN PHẨM (BÊN PHẢI) === */}
                <Col xs={24} sm={24} md={18} lg={18}>
                    {/* Header sắp xếp */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: '#fff', padding: 10, borderRadius: 8 }}>
                        <Text>Hiển thị <strong>{products.length}</strong> trên <strong>{total}</strong> sản phẩm</Text>
                        <Space>
                            <Text>Sắp xếp:</Text>
                            <Select
                                value={filter.sortBy}
                                style={{ width: 180 }}
                                onChange={(val) => setFilter({ ...filter, sortBy: val })}
                            >
                                <Option value="createdAt">Mới nhất</Option>
                                <Option value="price">Giá giảm dần</Option>
                            </Select>
                        </Space>
                    </div>

                    {/* Grid Sản phẩm */}
                    <Spin spinning={loading}>
                        {products.length === 0 ? (
                            <Empty description="Không tìm thấy sản phẩm nào" />
                        ) : (
                            <Row gutter={[16, 16]}>
                                {products.map(product => (
                                    <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
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
                                                            const token = localStorage.getItem('access_token');

                                                            if (!token) {
                                                                message.warning('Vui lòng đăng nhập để mua hàng!');
                                                                navigate('/login');
                                                                return;
                                                            }
                                                            // Check Login nhanh

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
                    </Spin>

                    {/* Phân trang */}
                    <div style={{ marginTop: 30, textAlign: 'center' }}>
                        <Pagination
                            current={filter.page}
                            pageSize={filter.size}
                            total={total}
                            onChange={(page, pageSize) => setFilter({ ...filter, page, size: pageSize })}
                            showSizeChanger
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ClientProductPage;