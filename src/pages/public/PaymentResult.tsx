import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import axiosClient from '../../api/axiosClient'; // Đảm bảo import đúng axiosClient

const PaymentResult: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'success' | 'error'>();
    const [msg, setMsg] = useState('Đang xử lý thanh toán...');

    useEffect(() => {
        const verifyPayment = async () => {
            // 1. Lấy toàn bộ tham số VNPay trả về trên URL
            // Ví dụ: ?vnp_Amount=1000000&vnp_ResponseCode=00&vnp_TxnRef=123...
            const params = Object.fromEntries(searchParams.entries());
            // Thử log params ở FE xem có bị biến đổi không
            console.log("Params gửi đi:", params);
            try {
                // 2. Gọi về Backend để verify chữ ký và update DB
                // Backend cần API: /api/payment/vnpay-callback
                const res: any = await axiosClient.get('/payment/vnpay-callback', { params });

                if (res.code === 1000) {
                    setStatus('success');
                    setMsg('Thanh toán thành công! Đơn hàng đã được xác nhận.');
                    // Xóa giỏ hàng local nếu cần
                    // localStorage.removeItem('cart'); 
                } else {
                    setStatus('error');
                    setMsg('Thanh toán thất bại hoặc chữ ký không hợp lệ.');
                }
            } catch (error) {
                console.error(error);
                setStatus('error');
                setMsg('Lỗi kết nối đến hệ thống xác thực.');
            } finally {
                setLoading(false);
            }
        };

        // Chỉ chạy khi URL có chứa mã phản hồi từ VNPay
        if (searchParams.get('vnp_ResponseCode')) {
            verifyPayment();
        } else {
            // Nếu người dùng tự mò vào trang này mà ko có params
            setLoading(false);
            setStatus('error');
            setMsg('Không tìm thấy thông tin giao dịch.');
        }
    }, []);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Spin size="large" />
                <h3 style={{ marginTop: 20 }}>Đang xác thực giao dịch với VNPay...</h3>
            </div>
        );
    }

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <Result
                status={status}
                title={status === 'success' ? "Thanh toán thành công" : "Thanh toán thất bại"}
                subTitle={msg}
                extra={[
                    <Button type="primary" key="home" onClick={() => navigate('/')}>
                        Về trang chủ
                    </Button>,
                    <Button key="orders" onClick={() => navigate('/my-orders')}>
                        Xem đơn hàng
                    </Button>,
                ]}
            />
        </div>
    );
};

export default PaymentResult;