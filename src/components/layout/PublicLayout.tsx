import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Badge, Space, Popover, List, Typography, Avatar, Row, Col, Divider } from 'antd';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined, LoginOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext'; 
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const { Header, Content, Footer } = Layout;
const { Text, Title } = Typography;

const currentUserName = localStorage.getItem('username'); 

const PublicLayout: React.FC = () => {
    const navigate = useNavigate();
    const { totalItems } = useCart();
    const isLoggedIn = !!localStorage.getItem('access_token');

    // State cho thông báo
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // --- LOGIC WEBSOCKET ---
    useEffect(() => {
        if (!isLoggedIn || currentUserName === null) return;

        // 1. Kết nối đến Server
        const apiUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "");
        const socket = new SockJS(`${apiUrl}/ws`);
        const stompClient = Stomp.over(socket);

        // Tắt log debug của stomp cho đỡ rác console
        stompClient.debug = () => {};

        stompClient.connect({}, () => {
            // 2. Subscribe vào topic riêng của User: /topic/notifications/{userId}
            stompClient.subscribe(`/topic/notifications/${currentUserName}`, (message) => {
                const newNoti = JSON.parse(message.body);
                
                // 3. Có tin nhắn mới -> Cập nhật State
                setNotifications(prev => [newNoti, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // Có thể hiển thị thêm Toastify nhỏ ở góc nếu muốn
                // toast.info(newNoti.message);
            });
        });

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, [isLoggedIn]);

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
            {notifications.length === 0 && <div style={{padding: 20, textAlign: 'center'}}>Không có thông báo nào</div>}
        </div>
    );

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    return (
        <Layout style={{ minHeight: '100vh', background: 'var(--color-bg-body)' }}>
            <Header className="glass-effect" style={{ 
                position: 'sticky', top: 0, zIndex: 1000, width: '100%', 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 50px', height: 72, lineHeight: '72px'
            }}>
                <div className="logo hover-lift" style={{ 
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
                    items={[
                        { key: '/', label: <Link to="/">Trang chủ</Link> },
                        { key: '/products', label: <Link to="/products">Sản phẩm</Link> },
                        { key: '/my-orders', label: <Link to="/my-orders">Lịch sử đơn hàng</Link> }, 
                    ]} 
                />

                <Space size="large" style={{ alignItems: 'center' }}>
                    {/* --- 🔔 CÁI CHUÔNG THÔNG BÁO --- */}
                    {isLoggedIn && (
                        <Popover 
                            content={notificationContent} 
                            title="Thông báo mới" 
                            trigger="click"
                            placement="bottomRight"
                            onOpenChange={(visible) => {
                                if (visible) setUnreadCount(0); // Mở ra thì coi như đã đọc
                            }}
                        >
                            <div className="hover-lift" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
                                <Badge count={unreadCount} size="small">
                                    <BellOutlined style={{ fontSize: 22, color: 'var(--text-dark)' }} />
                                </Badge>
                            </div>
                        </Popover>
                    )}

                    {/* Giỏ hàng */}
                    <div className="hover-lift" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }} onClick={() => navigate('/cart')}>
                        <Badge count={totalItems} showZero size="small">
                            <ShoppingCartOutlined style={{ fontSize: 22, color: 'var(--text-dark)' }} />
                        </Badge>
                    </div>

                    {isLoggedIn ? (
                        <Space size="middle" style={{ marginLeft: 16 }}>
                            <Button type="text" icon={<UserOutlined />} onClick={() => navigate('/admin')} style={{ fontWeight: 600 }}>
                                {localStorage.getItem('username')}
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
            </Header>

            <Content style={{ padding: '40px 50px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
                <div className="premium-card animate-fade-up" style={{ background: '#fff', minHeight: 'calc(100vh - 250px)', padding: 32 }}>
                    <Outlet />
                </div>
            </Content>

            <Footer style={{ background: '#1e293b', padding: '80px 50px 40px', color: 'rgba(255,255,255,0.65)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Row gutter={[40, 40]}>
                        <Col xs={24} md={8}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 20 }}>WIMS SHOP</div>
                            <Text style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)' }}>
                                Thiên đường mua sắm sành điệu dành cho giới trẻ. Chúng tôi cam kết mang đến những sản phẩm chất lượng nhất với giá thành hợp lý nhất.
                            </Text>
                        </Col>
                        <Col xs={12} md={4}>
                            <Title level={4} style={{ marginTop: 0, marginBottom: 24, color: '#fff' }}>Khám phá</Title>
                            <Space direction="vertical" size="middle">
                                <Link to="/" style={{ color: 'rgba(255,255,255,0.65)' }} className="hover-lift">Trang chủ</Link>
                                <Link to="/products" style={{ color: 'rgba(255,255,255,0.65)' }} className="hover-lift">Sản phẩm</Link>
                                <Link to="/cart" style={{ color: 'rgba(255,255,255,0.65)' }} className="hover-lift">Giỏ hàng</Link>
                            </Space>
                        </Col>
                        <Col xs={12} md={4}>
                            <Title level={4} style={{ marginTop: 0, marginBottom: 24, color: '#fff' }}>Hỗ trợ</Title>
                            <Space direction="vertical" size="middle">
                                <Text style={{ color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>Hướng dẫn mua hàng</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>Chính sách đổi trả</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>Liên hệ</Text>
                            </Space>
                        </Col>
                        <Col xs={24} md={8}>
                            <Title level={4} style={{ marginTop: 0, marginBottom: 24, color: '#fff' }}>Liên hệ với chúng tôi</Title>
                            <Text style={{ display: 'block', marginBottom: 12, color: 'rgba(255,255,255,0.65)' }}>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</Text>
                            <Text style={{ display: 'block', marginBottom: 12, color: 'rgba(255,255,255,0.65)' }}>Email: support@wimsshop.com</Text>
                            <Text style={{ display: 'block', color: 'rgba(255,255,255,0.65)' }}>Hotline: 1900 1234</Text>
                        </Col>
                    </Row>
                    <Divider style={{ margin: '40px 0 24px', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                        ©{new Date().getFullYear()} WIMS SHOP. All rights reserved. Built with ❤️ by Xuan Tin
                    </div>
                </div>
            </Footer>
        </Layout>
    );
};

export default PublicLayout;