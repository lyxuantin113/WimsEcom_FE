import React from 'react';
import { Typography, Button } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const CartEmpty: React.FC = () => {
    const navigate = useNavigate();
    
    return (
        <div className="animate-fade-up" style={{ textAlign: 'center', padding: '120px 0', background: 'var(--color-bg-body)', borderRadius: 16 }}>
            <div style={{ background: '#fff', width: 120, height: 120, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-sm)' }}>
                <ShoppingOutlined style={{ fontSize: 60, color: 'var(--color-primary)' }} />
            </div>
            <Title level={3} style={{ fontWeight: 700, letterSpacing: '-0.5px' }}>Giỏ hàng của bạn đang trống</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 32, fontSize: 16 }}>Hãy quay lại khám phá thêm các sản phẩm tuyệt vời nhé!</Text>
            <Button type="primary" size="large" onClick={() => navigate('/products')} style={{ padding: '0 40px', height: 50, borderRadius: 25, fontWeight: 600, boxShadow: 'var(--shadow-md)' }}>
                Tiếp tục mua sắm
            </Button>
        </div>
    );
};

export default CartEmpty;
