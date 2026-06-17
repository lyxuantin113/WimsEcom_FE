import React from 'react';
import { Table, Button, InputNumber, Typography, Space, Image, Popconfirm, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { CartItemResponse } from '../../../../types/backend';

const { Text } = Typography;

interface CartTableProps {
    items: CartItemResponse[];
    loading: boolean;
    affectedProductIds: number[];
    onQuantityChange: (itemId: number, newQuantity: number) => void;
    onDelete: (itemId: number) => void;
}

const CartTable: React.FC<CartTableProps> = ({
    items,
    loading,
    affectedProductIds,
    onQuantityChange,
    onDelete
}) => {
    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'product',
            render: (text: string, record: CartItemResponse) => {
                const isDiscounted = affectedProductIds.includes(record.productId);
                return (
                    <Space>
                        <Image src={record.productImage} width={60} style={{ borderRadius: 4 }} />
                        <div style={{ maxWidth: 200 }}>
                            <Text strong>{text}</Text>
                            {isDiscounted && (
                                <Tag color="red" style={{
                                    position: 'absolute', top: -5, left: -5,
                                    fontSize: 16, padding: '2px 6px', margin: 0,
                                    zIndex: 1, boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                                }}>
                                    -SALE
                                </Tag>
                            )}
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `${price.toLocaleString()} đ`,
            responsive: ['md'] as any,
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number, record: CartItemResponse) => (
                <InputNumber
                    min={1}
                    value={quantity}
                    onChange={(val) => onQuantityChange(record.id, Number(val))}
                    style={{ width: 60 }}
                />
            ),
        },
        {
            title: 'Thành tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (total: number) => <Text type="danger" strong>{total?.toLocaleString()} đ</Text>,
        },
        {
            key: 'action',
            render: (_: any, record: CartItemResponse) => (
                <Popconfirm title="Xóa?" onConfirm={() => onDelete(record.id)}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={items}
            rowKey="id"
            pagination={false}
            loading={loading}
            scroll={{ x: 600 }}
        />
    );
};

export default CartTable;
