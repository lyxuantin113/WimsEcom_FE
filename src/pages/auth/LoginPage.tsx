import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd'; // Import linh kiện từ kho Ant Design
import { UserOutlined, LockOutlined } from '@ant-design/icons'; // Import icon
import { useNavigate } from 'react-router-dom'; // Dùng để chuyển trang
import authApi from '../../api/authApi'; // API mình vừa viết
import type { LoginRequest } from '../../types/auth'; // Interface mình vừa định nghĩa

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // Biến trạng thái: Có đang load không?

    // Hàm này chạy khi người dùng bấm nút "Đăng nhập" VÀ các ô input đã hợp lệ
    // values chính là object chứa username/password (Ant Design tự gom cho mình)
    const onFinish = async (values: LoginRequest) => {
        try {
            setLoading(true); // Bật chế độ xoay xoay
            
            // 1. Gọi API (Giống Controller gọi Service)
            const response = await authApi.login(values);

            // 2. Kiểm tra kết quả (Code 1000 là thành công - theo ApiResponse.java)
            if (response && response.code === 1000) {
                message.success('Đăng nhập thành công!');

                // 3. Lưu Token vào "két sắt" LocalStorage
                // Lưu ý: response.result chính là LoginResponse (chứa token, username, role)
                localStorage.setItem('access_token', response.result.token);
                localStorage.setItem('user_role', response.result.role);
                localStorage.setItem('username', response.result.username);

                // 4. Chuyển hướng vào trang Dashboard (hoặc trang chủ)
                if (response.result.role === 'ADMIN') {
                    navigate('/admin'); // Sếp thì vào phòng làm việc
                } else {
                    navigate('/'); // Khách thì ra cửa hàng
                }
            } else {
                message.error(response.message || 'Đăng nhập thất bại');
            }
        } catch (error: any) {
            // Xử lý lỗi nếu gọi API thất bại (Mạng lag, sai pass...)
            message.error('Lỗi hệ thống hoặc sai thông tin đăng nhập');
            console.error(error);
        } finally {
            setLoading(false); // Tắt xoay xoay dù thành công hay thất bại
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            backgroundColor: '#f0f2f5' // Màu nền xám nhẹ chuẩn Enterprise
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={3}>WIMS LOGIN</Title>
                    <Text type="secondary">Hệ thống quản lý kho & bán hàng</Text>
                </div>

                {/* Form của Ant Design: Tự quản lý state, tự validate */}
                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish} // Gắn hàm xử lý submit vào đây
                    size="large"
                >
                    {/* Ô Username */}
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]} // Validate
                    >
                        <Input prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>

                    {/* Ô Password */}
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    {/* Nút Submit */}
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;