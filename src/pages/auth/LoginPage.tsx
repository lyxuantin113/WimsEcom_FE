import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import type { LoginRequest, RegisterRequest } from '../../types/auth';
import { useAuthDispatch } from '../../context/AuthContext';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuthDispatch();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login'); // Trạng thái tab hiện tại

    // 1. Xử lý Đăng nhập
    const onLogin = async (values: LoginRequest) => {
        try {
            setLoading(true);
            const response = await authApi.login(values);

            if (response && response.code === 1000 && response.result) {
                message.success('Đăng nhập thành công!');

                // LƯU VÀO CONTEXT (Reactive)
                login(response.result.token, response.result.username, response.result.role);

                if (response.result.role === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                message.error(response.message || 'Đăng nhập thất bại');
            }
        } catch (error: any) {
            message.error('Lỗi hệ thống hoặc sai thông tin đăng nhập');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Xử lý Đăng ký
    const onRegister = async (values: RegisterRequest) => {
        try {
            setLoading(true);
            const response = await authApi.register(values);
            if (response.code === 1000) {
                message.success('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
                setActiveTab('login'); // Tự động chuyển về tab đăng nhập sau khi đăng ký thành công
            } else {
                message.error(response.message || 'Đăng ký thất bại');
            }
        } catch (error: any) {
            message.error('Lỗi hệ thống hoặc Username/Email đã tồn tại');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f0f2f5'
        }}>
            <Card style={{ width: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={3}>WIMS Shop</Title>
                    <Text type="secondary">Chào mừng bạn đến với Wims!</Text>
                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key)}
                    centered
                    items={[
                        {
                            label: 'Đăng Nhập',
                            key: 'login',
                            children: (
                                <Form name="login_form" onFinish={onLogin} size="large" layout="vertical">
                                    <Form.Item
                                        name="username"
                                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" block loading={loading}>
                                            Đăng nhập ngay
                                        </Button>
                                    </Form.Item>
                                </Form>
                            ),
                        },
                        {
                            label: 'Đăng Ký',
                            key: 'register',
                            children: (
                                <Form name="register_form" onFinish={onRegister} size="large" layout="vertical">
                                    <Form.Item
                                        name="username"
                                        rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Username" />
                                    </Form.Item>

                                    <Form.Item
                                        name="fullName"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                                    >
                                        <Input prefix={<IdcardOutlined />} placeholder="Họ và tên" />
                                    </Form.Item>

                                    <Form.Item
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' },
                                            { type: 'email', message: 'Email không đúng định dạng!' }
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="Email liên hệ" />
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                            { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự!' }
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" block loading={loading} style={{ backgroundColor: '#52c41a' }}>
                                            Tạo tài khoản mới
                                        </Button>
                                    </Form.Item>
                                </Form>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default LoginPage;