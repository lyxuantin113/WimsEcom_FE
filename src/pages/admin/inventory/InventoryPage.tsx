import React, { useEffect, useMemo } from 'react';
import { Table, Card, Typography, Tag, Space, DatePicker, Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { InventoryTransactionResponse } from '../../../api/inventoryApi';
import dayjs from 'dayjs';
import { useInventory } from '../hooks/useInventory';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const InventoryPage: React.FC = () => {
    // 1. Gói gọn toàn bộ state và hàm gọi API vào Custom Hook
    const {
        transactions,
        loading,
        total,
        currentPage,
        keyword,
        setKeyword,
        setDates,
        fetchTransactions,
        handleSearch
    } = useInventory();

    useEffect(() => {
        fetchTransactions(1);
    }, [fetchTransactions]);

    // 2. Dùng useMemo bọc cấu trúc Cột lại để tránh render lại mảng columns vô nghĩa
    const columns = useMemo(() => [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        {
            title: 'Mã SP',
            dataIndex: 'productCode',
            key: 'productCode',
            render: (text: string) => <Text strong>{text}</Text>
        },
        { title: 'Tên Sản Phẩm', dataIndex: 'productName', key: 'productName' },
        {
            title: 'Biến Động',
            key: 'quantity',
            render: (_: any, record: InventoryTransactionResponse) => {
                const isPositive = record.quantity > 0;
                return (
                    <Text strong style={{ color: isPositive ? '#52c41a' : '#f5222d', fontSize: '16px' }}>
                        {isPositive ? '+' : ''}{record.quantity}
                    </Text>
                );
            }
        },
        {
            title: 'Loại Giao Dịch',
            dataIndex: 'transactionType',
            key: 'transactionType',
            render: (type: string) => {
                const colorMap: Record<string, string> = {
                    'IMPORT': 'blue',
                    'EXPORT': 'red',
                    'RETURN': 'orange'
                };
                const labelMap: Record<string, string> = {
                    'IMPORT': 'NHẬP KHO',
                    'EXPORT': 'XUẤT BÁN',
                    'RETURN': 'HOÀN TRẢ'
                };
                return <Tag color={colorMap[type] || 'default'}>{labelMap[type] || type}</Tag>;
            }
        },
        { title: 'Lý Do', dataIndex: 'note', key: 'note' },
        {
            title: 'Thời Gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm:ss')
        }
    ], []); // Cột này không phụ thuộc State bên ngoài nên dependencies = []

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>Lịch sử Xuất / Nhập Kho</Title>
            </div>

            <Card style={{ marginBottom: 20 }}>
                <Space wrap>
                    <Input
                        placeholder="Tìm theo mã hoặc tên SP"
                        prefix={<SearchOutlined />}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 250 }}
                    />
                    <RangePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        onChange={(vals) => setDates(vals as any)}
                    />
                    <Button type="primary" onClick={handleSearch}>Lọc Dữ Liệu</Button>
                </Space>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    dataSource={transactions}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: 10,
                        total: total,
                        onChange: (page) => fetchTransactions(page)
                    }}
                />
            </Card>
        </div>
    );
};

export default InventoryPage;
