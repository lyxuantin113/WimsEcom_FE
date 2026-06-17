import React from 'react';
import { Row, Col, Typography, Select, Spin, Empty, Space, Pagination } from 'antd';
import ProductCard from '../../../components/product/ProductCard';
import { useClientProduct } from '../hooks/useClientProduct';
import ProductFilter from './components/ProductFilter';

const { Title, Text } = Typography;
const { Option } = Select;

const ClientProductPage: React.FC = () => {
    const {
        products,
        categories,
        loading,
        total,
        filter,
        setFilter,
        priceRange,
        setPriceRange,
        formatCurrency,
        resetFilters
    } = useClientProduct();

    return (
        <div className="animate-fade-up" style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px 80px' }}>
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
                <Title level={1} style={{ fontWeight: 800, fontSize: 40, letterSpacing: '-1px', marginBottom: 8 }}>
                    Cửa Hàng
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>Khám phá bộ sưu tập sản phẩm mới nhất của chúng tôi</Text>
            </div>

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={6}>
                    <ProductFilter
                        filter={filter}
                        setFilter={setFilter}
                        categories={categories}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        formatCurrency={formatCurrency}
                        resetFilters={resetFilters}
                    />
                </Col>

                <Col xs={24} lg={18}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 16,
                        marginBottom: 32,
                        background: '#fff',
                        padding: '16px 24px',
                        borderRadius: 16,
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <Text style={{ fontSize: 15 }}>Tìm thấy <strong style={{ color: 'var(--color-primary)' }}>{total}</strong> sản phẩm</Text>
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

                    <Spin spinning={loading} size="large">
                        {products.length === 0 ? (
                            <div style={{ padding: '80px 0', textAlign: 'center' }}>
                                <Empty description={<Text type="secondary" style={{ fontSize: 16 }}>Không tìm thấy sản phẩm nào phù hợp với bộ lọc</Text>} />
                            </div>
                        ) : (
                            <Row gutter={[24, 32]}>
                                {products.map((product, index) => {
                                    return (
                                        <Col xs={12} sm={12} md={8} lg={8} key={product.id}>
                                            <ProductCard product={product} delayIndex={index} />
                                        </Col>
                                    )
                                })}
                            </Row>
                        )}
                    </Spin>

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
