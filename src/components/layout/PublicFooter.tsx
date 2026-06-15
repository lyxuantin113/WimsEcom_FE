import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import MarqueeBanner from '../home/MarqueeBanner';

const { Footer } = Layout;
const { Text, Title } = Typography;

const PublicFooter: React.FC = () => {
    return (
        <div>
            <MarqueeBanner />
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
                            <Text style={{ display: 'block', marginBottom: 12, color: 'rgba(255,255,255,0.65)' }}>Địa chỉ: Gò Vấp, TP. Hồ Chí Minh</Text>
                            <Text style={{ display: 'block', marginBottom: 12, color: 'rgba(255,255,255,0.65)' }}>Email: lyxuantin113@gmail.com</Text>
                            <Text style={{ display: 'block', color: 'rgba(255,255,255,0.65)' }}>Hotline: 0912 644 361</Text>
                        </Col>
                    </Row>
                    <Divider style={{ margin: '40px 0 24px', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                        ©{new Date().getFullYear()} WIMS SHOP. All rights reserved. Built with ❤️ by Xuan Tin
                    </div>
                </div>
            </Footer>
        </div>
    );
};

export default PublicFooter;
