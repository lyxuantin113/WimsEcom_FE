import React, { useState } from 'react';
import { Layout, Menu, Button, theme, message } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    ShoppingOutlined,
    OrderedListOutlined,
    LogoutOutlined,
    DiscordOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';

// Destructuring "Hộp công cụ" Layout
const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false); // Trạng thái thu nhỏ/mở rộng menu
    const navigate = useNavigate();
    
    // Lấy theme mặc định của Antd để background màu trắng cho đẹp
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('username');
        message.success('Đăng xuất thành công');
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* 1. SIDEBAR: Menu bên trái */}
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: 'white', lineHeight: '32px', fontWeight: 'bold' }}>
                    {collapsed ? 'WIMS' : 'WIMS ADMIN'}
                </div>
                
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    // Định nghĩa các mục Menu
                    items={[
                        {
                            key: '/admin',
                            icon: <DashboardOutlined />,
                            label: 'Dashboard',
                            onClick: () => navigate('/admin'),
                        },
                        {
                            key: '/admin/products',
                            icon: <ShoppingOutlined />,
                            label: 'Quản lý Sản phẩm',
                            onClick: () => navigate('/admin/products'),
                        },
                        {
                            key: '/admin/categories',
                            icon: <ShoppingOutlined />,
                            label: 'Quản lý Danh mục',
                            onClick: () => navigate('/admin/categories'),
                        },
                        {
                            key: '/admin/orders',
                            icon: <OrderedListOutlined />,
                            label: 'Quản lý Đơn hàng',
                            onClick: () => navigate('/admin/orders'),
                        },
                        {
                            key: '/admin/banners',
                            icon: <ShoppingOutlined />,
                            label: 'Quản lý Banner',
                            onClick: () => navigate('/admin/banners'),
                        },
                        {
                            key: '/admin/discounts',
                            icon: <DiscordOutlined />,
                            label: 'Quản lý Mã giảm giá',
                            onClick: () => navigate('/admin/discounts'),
                        }
                    ]}
                />
            </Sider>

            {/* 2. PHẦN CHÍNH BÊN PHẢI */}
            <Layout>
                {/* HEADER: Thanh trên cùng */}
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontWeight: 'bold' }}>Xin chào, {localStorage.getItem('username')}</span>
                        <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </Header>

                {/* CONTENT: Nội dung thay đổi (Chỗ này quan trọng) */}
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {/* <Outlet /> là cái "lỗ chờ". 
                        Khi route con thay đổi, nội dung route đó sẽ chui vào đây. */}
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;