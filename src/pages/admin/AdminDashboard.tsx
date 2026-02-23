import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, message, Select, Space, Tag, Table } from 'antd'; // Thêm Select, Space
import { DollarOutlined, ShoppingCartOutlined, UserOutlined, AppstoreOutlined, CalendarOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axiosClient from '../../api/axiosClient';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    
    // 1. State lưu năm được chọn (Mặc định là năm nay)
    const currentYear = dayjs().year();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);

    // 2. Hàm tạo danh sách năm (Từ 2023 -> Năm hiện tại)
    const getYearOptions = () => {
        const startYear = 2023; // Năm bắt đầu dự án
        const years = [];
        // Vòng lặp lùi từ năm nay về năm bắt đầu
        for (let i = currentYear; i >= startYear; i--) {
            years.push(i);
        }
        return years;
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 3. Truyền params year lên API
                const res: any = await axiosClient.get('/admin/stats', {
                    params: { year: selectedYear } 
                });
                
                if (res.code === 1000) {
                    setStats(res.result);
                }
            } catch (error) {
                message.error('Lỗi tải thống kê');
            }
        };
        
        fetchStats();
    }, [selectedYear]); // 4. Quan trọng: Khi selectedYear đổi -> Chạy lại useEffect -> Gọi lại API

    const topProductColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            render: (text: string, record: any) => (
                <Space>
                    <img src={record.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    <span style={{ fontWeight: 500 }}>{text}</span>
                </Space>
            )
        },
        {
            title: 'Đã bán',
            dataIndex: 'totalSold',
            render: (val: number) => <Tag color="blue">{val} cái</Tag>
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            render: (val: number) => <span style={{ color: 'green', fontWeight: 'bold' }}>{val.toLocaleString()} đ</span>
        }
    ];

    if (!stats) return <div>Loading...</div>;

    return (
        <div className="animate-fade-up" style={{ padding: '24px', background: 'var(--color-bg-body)', minHeight: '100vh' }}>
            {/* Header: Tiêu đề + Bộ lọc Năm */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>Tổng quan hệ thống</Title>
                
                <Space>
                    <span style={{ fontWeight: 500 }}>Chọn năm:</span>
                    <Select 
                        value={selectedYear} 
                        onChange={(value) => setSelectedYear(value)}
                        style={{ width: 120 }}
                        suffixIcon={<CalendarOutlined />}
                    >
                        {getYearOptions().map(year => (
                            <Option key={year} value={year}>Năm {year}</Option>
                        ))}
                    </Select>
                </Space>
            </div>
            
            {/* CARDS THỐNG KÊ */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="premium-card hover-lift" bordered={false} style={{ borderRadius: 16 }}>
                        <Statistic 
                            title={<span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{`Tổng doanh thu (${selectedYear})`}</span>}
                            value={stats.totalRevenue} 
                            precision={0}
                            prefix={<DollarOutlined />} 
                            suffix="đ"
                            valueStyle={{ color: 'var(--color-primary)', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="premium-card hover-lift" bordered={false} style={{ borderRadius: 16 }}>
                        <Statistic 
                            title={<span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Đơn hàng</span>}
                            value={stats.totalOrders} 
                            prefix={<ShoppingCartOutlined style={{ color: '#faad14' }} />} 
                            valueStyle={{ fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="premium-card hover-lift" bordered={false} style={{ borderRadius: 16 }}>
                        <Statistic 
                            title={<span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Sản phẩm</span>}
                            value={stats.totalProducts} 
                            prefix={<AppstoreOutlined style={{ color: '#13c2c2' }} />} 
                            valueStyle={{ fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="premium-card hover-lift" bordered={false} style={{ borderRadius: 16 }}>
                        <Statistic 
                            title={<span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Người dùng</span>}
                            value={stats.totalUsers} 
                            prefix={<UserOutlined style={{ color: '#722ed1' }} />} 
                            valueStyle={{ fontWeight: 700 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* BIỂU ĐỒ */}
            <Card className="premium-card" bordered={false} title={<span style={{ fontWeight: 700 }}>{`Biểu đồ doanh thu năm ${selectedYear}`}</span>} style={{ borderRadius: 16, marginBottom: 32 }}>
                <div style={{ width: '100%', height: 400, marginTop: 16 }}>
                    <ResponsiveContainer>
                        <BarChart data={stats.revenueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="month" tickFormatter={(value) => `Tháng ${value}`} axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                            <YAxis tickFormatter={(value) => value > 1000000 ? ( value > 1000000000 ? `${value / 1000000000}B` : `${value / 1000000}M`) : `${value / 1000}K`} axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                            <Tooltip formatter={(value?: number) => `${value?.toLocaleString() ?? 0} đ`} cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)' }} />
                            <Bar dataKey="revenue" fill="var(--color-primary)" name="Doanh thu" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card className="premium-card" bordered={false} title={<span style={{ fontWeight: 700 }}>{`Top 5 sản phẩm bán chạy năm ${selectedYear}`}</span>} style={{ borderRadius: 16 }}>
                        <Table 
                            dataSource={stats.topProducts} 
                            columns={topProductColumns} 
                            rowKey="id" 
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;