import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Badge, Space, Popover, List, Typography, Avatar } from 'antd';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined, LoginOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext'; 
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

// Mock user ID (Thực tế bạn lấy từ JWT decode hoặc localStorage)
// Ví dụ lưu lúc login: localStorage.setItem('userId', '1');
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
        const socket = new SockJS('http://localhost:8080/ws');
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
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ 
                position: 'sticky', top: 0, zIndex: 1000, width: '100%', 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
                <div className="logo" style={{ fontSize: 20, fontWeight: 'bold', cursor: 'pointer', color: '#1677ff' }} onClick={() => navigate('/')}>
                    MY STORE
                </div>

                <Menu 
                    mode="horizontal" 
                    selectedKeys={[location.pathname]}
                    style={{ flex: 1, borderBottom: 'none', marginLeft: 40 }}
                    items={[
                        { key: '/', label: <Link to="/">Trang chủ</Link> },
                        { key: '/products', label: <Link to="/products">Sản phẩm</Link> },
                        { key: '/my-orders', label: <Link to="/my-orders">Lịch sử đơn hàng</Link> }, // Sửa lại link cho đúng với router cũ
                    ]} 
                />

                <Space size="large">
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
                            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Badge count={unreadCount} size="small">
                                    <BellOutlined style={{ fontSize: 24, color: '#333' }} />
                                </Badge>
                            </div>
                        </Popover>
                    )}

                    {/* Giỏ hàng */}
                    <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/cart')}>
                        <Badge count={totalItems} showZero size="small">
                            <ShoppingCartOutlined style={{ fontSize: 24, color: '#333' }} />
                        </Badge>
                    </div>

                    {isLoggedIn ? (
                        <>
                            <Button type="text" icon={<UserOutlined />} onClick={() => navigate('/admin')}>
                                {localStorage.getItem('username')}
                            </Button>
                            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
                                Đăng xuất
                            </Button>
                        </>
                    ) : (
                        <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                            Đăng nhập
                        </Button>
                    )}
                </Space>
            </Header>

            <Content style={{ padding: '20px 50px', background: '#f5f5f5' }}>
                <div style={{ background: '#fff', minHeight: 380, padding: 24, borderRadius: 8 }}>
                    <Outlet />
                </div>
            </Content>

            <Footer style={{ textAlign: 'center' }}>My Store ©2024 Created by You</Footer>
        </Layout>
    );
};

export default PublicLayout;