import React from 'react';
import { Card, Typography, Divider, Slider, Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import SearchHistoryInput from '../../../../components/SearchHistoryInput';
import type { CategoryResponse } from '../../../../types/backend';

const { Text } = Typography;

interface ProductFilterProps {
    filter: any;
    setFilter: (filter: any) => void;
    categories: CategoryResponse[];
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    formatCurrency: (amount: number) => string;
    resetFilters: () => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
    filter,
    setFilter,
    categories,
    priceRange,
    setPriceRange,
    formatCurrency,
    resetFilters
}) => {
    return (
        <Card
            className="premium-card"
            title={<span style={{ fontWeight: 700 }}><FilterOutlined style={{ marginRight: 8 }} /> Bộ lọc</span>}
            style={{ position: 'sticky', top: 100, borderRadius: 16 }}
            styles={{ body: { padding: '24px' } }}
        >
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

            <div style={{ marginBottom: 32 }}>
                <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>Khoảng giá</Text>
                <Slider
                    range
                    min={0}
                    max={50000000}
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
                onClick={resetFilters}
                style={{ fontWeight: 600, marginTop: 12 }}
            >
                Xóa tất cả bộ lọc
            </Button>
        </Card>
    );
};

export default React.memo(ProductFilter);
