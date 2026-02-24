import React from 'react';
import { Typography, Row, Col, Card } from 'antd';
import { RocketOutlined, SyncOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import WelcomeBanner from '../../components/home/WelcomeBanner';

const { Title, Text, Paragraph } = Typography;

const AboutPage: React.FC = () => {
    const policies = [
        {
            icon: <RocketOutlined style={{ fontSize: 40, color: 'var(--color-primary)', marginBottom: 16 }} />,
            title: 'Giao Hàng Siêu Tốc',
            description: 'Cam kết giao hàng trong vòng 2H ở nội thành và 2-3 ngày với các tỉnh lân cận. Quy trình đóng gói cẩn thận, đảm bảo hàng hóa nguyên vẹn đến tay bạn.',
        },
        {
            icon: <SyncOutlined style={{ fontSize: 40, color: 'var(--color-primary)', marginBottom: 16 }} />,
            title: 'Đổi Trả Dễ Dàng',
            description: 'Chính sách đổi trả linh hoạt trong vòng 7 ngày. Bạn có thể yên tâm mua sắm và đổi sản phẩm nếu không vừa size hoặc không ưng ý, thủ tục nhanh gọn.',
        },
        {
            icon: <CustomerServiceOutlined style={{ fontSize: 40, color: 'var(--color-primary)', marginBottom: 16 }} />,
            title: 'Hỗ Trợ 24/7',
            description: 'Đội ngũ CSKH chuyên nghiệp luôn sẵn sàng lắng nghe và giải quyết mọi thắc mắc của bạn qua Hotline, Zalo hoặc Fanpage một cách tận tâm nhất.',
        },
    ];

    return (
        <div className="animate-fade-up">
            {/* 1. Welcome Banner */}
            <WelcomeBanner 
                title="GIỚI THIỆU" 
                subtitle="CÂU CHUYỆN VỀ CHÚNG TÔI VÀ SỨ MỆNH MANG LẠI TRẢI NGHIỆM TỐT NHẤT" 
            />

            {/* 2. Giới thiệu chung */}
            <div style={{ textAlign: 'center', maxWidth: 800, margin: '60px auto 80px' }}>
                <Title level={1} style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-primary)' }}>
                    WIMS SHOP
                </Title>
                <div style={{ width: 60, height: 4, background: 'var(--color-primary)', borderRadius: 2, margin: '24px auto' }} />
                <Paragraph style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--text-muted)' }}>
                    Được thành lập với niềm đam mê mang lại những sản phẩm chất lượng nhất, 
                    <strong style={{ color: 'var(--text-dark)' }}> WIMS SHOP </strong> tự hào là điểm đến tin cậy cho những tín đồ yêu thích sự hoàn hảo. 
                    Chúng tôi chuyên cung cấp các mặt hàng đa dạng từ 
                    <strong style={{ color: 'var(--color-primary)' }}> Trang phục thời trang cao cấp</strong>, 
                    <strong style={{ color: 'var(--color-primary)' }}> Thiết bị điện tử thông minh</strong>, 
                    đến các sản phẩm <strong style={{ color: 'var(--color-primary)' }}>Điện máy tiện dụng</strong>.
                </Paragraph>
                <Paragraph style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--text-muted)' }}>
                    Với phương châm "Khách hàng là khối óc và trái tim của doanh nghiệp", chúng tôi không ngừng cải tiến dịch vụ, 
                    chọn lọc sản phẩm khắt khe để đem đến trải nghiệm mua sắm tuyệt vời nhất.
                </Paragraph>
            </div>

            {/* 3. Chính sách - Flip Cards */}
            <div style={{ marginBottom: 100 }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 60, fontWeight: 700 }}>
                    Tại Sao Chọn WIMS?
                </Title>
                <Row gutter={[32, 32]} justify="center">
                    {policies.map((policy, index) => (
                        <Col xs={24} md={8} key={index}>
                            <div className="flip-card">
                                <div className="flip-card-inner">
                                    {/* Mặt trước */}
                                    <div className="flip-card-front">
                                        {policy.icon}
                                        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                                            {policy.title}
                                        </Title>
                                    </div>
                                    {/* Mặt sau */}
                                    <div className="flip-card-back">
                                        <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
                                            {policy.title}
                                        </Title>
                                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 1.6 }}>
                                            {policy.description}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 4. Lời cảm ơn */}
            <Card className="premium-card" style={{ textAlign: 'center', borderRadius: 20 }} styles={{ body: { padding: '60px 40px' } }}>
                <Title level={3} style={{ marginBottom: 16, fontWeight: 700, color: 'var(--color-primary)' }}>
                    Lời Cảm Ơn
                </Title>
                <Paragraph style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
                    Chân thành cảm ơn bạn đã tin tưởng và lựa chọn WIMS SHOP. 
                    Sự ủng hộ của bạn là động lực to lớn để chúng tôi ngày càng phát triển và hoàn thiện hơn. 
                    Chúc bạn có những trải nghiệm mua sắm thật vui vẻ và thú vị!
                </Paragraph>
            </Card>
        </div>
    );
};

export default AboutPage;
