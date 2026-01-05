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
        <div>
            {/* Header: Tiêu đề + Bộ lọc Năm */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>Tổng quan hệ thống</Title>
                
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
            
            {/* CARDS THỐNG KÊ (Giữ nguyên code cũ) */}
            <Row gutter={16} style={{ marginBottom: 30 }}>
                <Col span={6}>
                    <Card>
                        <Statistic 
                            title={`Tổng doanh thu (${selectedYear})`} // Hiển thị năm cho rõ
                            value={stats.totalRevenue} 
                            precision={0}
                            prefix={<DollarOutlined />} 
                            suffix="đ"
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                {/* ... Các card khác giữ nguyên ... */}
                 <Col span={6}>
                    <Card>
                        <Statistic 
                            title="Đơn hàng" 
                            value={stats.totalOrders} 
                            prefix={<ShoppingCartOutlined />} 
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic 
                            title="Sản phẩm" 
                            value={stats.totalProducts} 
                            prefix={<AppstoreOutlined />} 
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic 
                            title="Người dùng" 
                            value={stats.totalUsers} 
                            prefix={<UserOutlined />} 
                        />
                    </Card>
                </Col>
            </Row>

            {/* BIỂU ĐỒ (Giữ nguyên code cũ) */}
            <Card title={`Biểu đồ doanh thu năm ${selectedYear}`}>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={stats.revenueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" tickFormatter={(value) => `Tháng ${value}`} />
                            <YAxis tickFormatter={(value) => value > 1000000 ? ( value > 1000000000 ? `${value / 1000000000}B` : `${value / 1000000}M`) : `${value / 1000}K`} />
                            <Tooltip formatter={(value?: number) => `${value?.toLocaleString() ?? 0} đ`} />
                            <Bar dataKey="revenue" fill="#1677ff" name="Doanh thu" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={24}>
                    <Card title={`Top 5 sản phẩm bán chạy năm ${selectedYear}`}>
                        <Table 
                            dataSource={stats.topProducts} 
                            columns={topProductColumns} 
                            rowKey="id" 
                            pagination={false} // Tắt phân trang vì chỉ có 5 dòng
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;