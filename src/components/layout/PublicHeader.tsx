import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Badge, Space, Popover, List, Typography, Avatar, Grid, Drawer, Dropdown } from 'antd';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined, LoginOutlined, LogoutOutlined, BellOutlined, MenuOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuthState, useAuthDispatch } from '../../context/AuthContext';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const PublicHeader: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { totalItems } = useCart();
    const { isLoggedIn, user } = useAuthState();
    const { logout } = useAuthDispatch();

    // Breakpoints support responsive
    const screens = useBreakpoint();
    const isMobile = screens.md === false; // Kích thước màn hình xs, sm

    // State cho Mobile Drawer
    const [drawerVisible, setDrawerVisible] = useState(false);

    // State cho thông báo
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // --- LOGIC WEBSOCKET ---
    useEffect(() => {
        if (!isLoggedIn || !user) return;

        // 1. Cấu hình Stomp Client mới
        const apiUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "");
        const client = new Client({
            webSocketFactory: () => new SockJS(`${apiUrl}/ws`),
            onConnect: () => {
                // 2. Subscribe vào topic riêng của User
                client.subscribe(`/topic/notifications/${user.username}`, (message) => {
                    const newNoti = JSON.parse(message.body);
                    setNotifications(prev => [newNoti, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });
            },
            // Tắt debug rác
            debug: () => { },
            // Tự động retry nếu mất kết nối
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.activate();

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [isLoggedIn, user]);

    // Nội dung hiển thị khi bấm vào chuông
    const notificationContent = (
        <div style={{ width: 300, maxHeight: 400, overflowY: 'auto' }}>
            <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={(item) => (
                    <List.Item
                        style={{ cursor: 'pointer', padding: 10 }}
                        className="notification-item"
                        onClick={() => {
                            // Bấm vào -> Chuyển đến trang chi tiết đơn hàng
                            navigate(`/my-orders`); // Hoặc `/order-detail/${item.orderId}`
                        }}
                    >
                        <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: '#1677ff' }} icon={<BellOutlined />} />}
                            title={<Text style={{ fontSize: 13 }}>Cập nhật đơn hàng #{item.orderId}</Text>}
                            description={<Text type="secondary" style={{ fontSize: 12 }}>{item.message}</Text>}
                        />
                    </List.Item>
                )}
            />
            {notifications.length === 0 && <div style={{ padding: 20, textAlign: 'center' }}>Không có thông báo nào</div>}
        </div>
    );

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { key: '/', label: <Link to="/">Trang chủ</Link> },
        { key: '/products', label: <Link to="/products">Sản phẩm</Link> },
        { key: '/about', label: <Link to="/about">Giới thiệu</Link> },
        { key: '/my-orders', label: <Link to="/my-orders">Lịch sử đơn hàng</Link> },
    ];

    return (
        <Header className="glass-effect" style={{
            position: 'sticky', top: 0, zIndex: 1000, width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: isMobile ? '0 16px' : '0 50px', height: 72, lineHeight: '72px'
        }}>
            {isMobile ? (
                <>
                    {/* ---------------- MOBILE LAYOUT ---------------- */}
                    {/* 1. Left - Hamburger */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <Button type="text" icon={<MenuOutlined style={{ fontSize: 24, color: 'var(--color-primary)' }} />} onClick={() => setDrawerVisible(true)} />
                    </div>

                    {/* 2. Center - Logo */}
                    <div className="logo" style={{
                        fontSize: 22, fontWeight: 800, cursor: 'pointer',
                        color: 'var(--color-primary)', letterSpacing: '-0.5px',
                        textAlign: 'center'
                    }} onClick={() => navigate('/')}>
                        WIMS
                    </div>

                    {/* 3. Right - Icons */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                        {isLoggedIn && (
                            <Popover
                                content={notificationContent}
                                title="Thông báo mới"
                                trigger="click"
                                placement="bottomRight"
                                onOpenChange={(visible) => { if (visible) setUnreadCount(0); }}
                            >
                                <Badge count={unreadCount} size="small" style={{ cursor: 'pointer' }}>
                                    <BellOutlined style={{ fontSize: 20, color: 'var(--text-dark)' }} />
                                 </Badge>
                            </Popover>
                        )}

                        <Badge count={totalItems} showZero size="small" style={{ cursor: 'pointer' }} onClick={() => navigate('/cart')}>
                            <ShoppingCartOutlined style={{ fontSize: 22, color: 'var(--text-dark)' }} />
                        </Badge>

                        {isLoggedIn ? (
                            <Dropdown placement="bottomRight" menu={{
                                items: [
                                    { key: 'admin', label: 'Quản trị', icon: <UserOutlined />, onClick: () => navigate('/admin') },
                                    { type: 'divider' },
                                    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout, danger: true }
                                ]
                            }}>
                                <Avatar size="small" style={{ backgroundColor: 'var(--color-primary)', cursor: 'pointer' }} icon={<UserOutlined />} />
                            </Dropdown>
                        ) : (
                            <LoginOutlined style={{ fontSize: 22, color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => navigate('/login')} />
                        )}
                    </div>

                    {/* Drawer Menu */}
                    <Drawer
                        title={<span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 20 }}>WIMS SHOP</span>}
                        placement="left"
                        onClose={() => setDrawerVisible(false)}
                        open={drawerVisible}
                        width={280}
                        styles={{ body: { padding: 0 } }}
                    >
                        <Menu
                            mode="inline"
                            selectedKeys={[location.pathname]}
                            items={menuItems}
                            style={{ borderRight: 'none', fontSize: 16, paddingTop: 16 }}
                            onClick={() => setDrawerVisible(false)}
                        />
                    </Drawer>
                </>
            ) : (
                <>
                    {/* ---------------- DESKTOP LAYOUT ---------------- */}
                    <div className="logo" style={{
                        fontSize: 24, fontWeight: 800, cursor: 'pointer',
                        color: 'var(--color-primary)', letterSpacing: '-0.5px',
                        display: 'flex', alignItems: 'center'
                    }} onClick={() => navigate('/')}>
                        WIMS SHOP
                    </div>

                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        style={{ flex: 1, borderBottom: 'none', marginLeft: 60, background: 'transparent', fontSize: 16, fontWeight: 500 }}
                        items={menuItems}
                    />

                    <Space size="large" style={{ alignItems: 'center' }}>
                        {isLoggedIn && (
                            <Popover
                                content={notificationContent}
                                title="Thông báo mới"
                                trigger="click"
                                placement="bottomRight"
                                onOpenChange={(visible) => { if (visible) setUnreadCount(0); }}
                            >
                                <div className="hover-lift" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
                                    <Badge count={unreadCount} size="small">
                                        <BellOutlined style={{ fontSize: 22, color: 'var(--text-dark)' }} />
                                    </Badge>
                                </div>
                            </Popover>
                        )}

                        <div className="hover-lift" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }} onClick={() => navigate('/cart')}>
                            <Badge count={totalItems} showZero size="small">
                                <ShoppingCartOutlined style={{ fontSize: 22, color: 'var(--text-dark)' }} />
                            </Badge>
                        </div>

                        {isLoggedIn && user ? (
                            <Space size="middle" style={{ marginLeft: 16 }}>
                                <Button type="text" icon={<UserOutlined />} onClick={() => navigate('/admin')} style={{ fontWeight: 600 }}>
                                    {user.username}
                                </Button>
                                <Button danger type="text" icon={<LogoutOutlined />} onClick={handleLogout} style={{ fontWeight: 500 }}>
                                    Đăng xuất
                                </Button>
                            </Space>
                        ) : (
                            <Button type="primary" size="large" icon={<LoginOutlined />} onClick={() => navigate('/login')} style={{ marginLeft: 16, fontWeight: 600, padding: '0 24px' }}>
                                Đăng nhập
                            </Button>
                        )}
                    </Space>
                </>
            )}
        </Header>
    );
};

export default PublicHeader;
