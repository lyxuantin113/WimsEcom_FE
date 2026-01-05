import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    // 1. Lấy thông tin từ kho
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role'); 

    // 2. Check 1: Chưa đăng nhập -> Đá về Login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 3. Check 2: Đã đăng nhập nhưng KHÔNG PHẢI ADMIN -> Đá về Trang chủ
    // (Đây là chỗ ta fix cứng theo yêu cầu của cậu)
    if (role !== 'ADMIN') {
        // Có thể bật dòng này lên để user hiểu tại sao bị đá
        // message.warning('Bạn không có quyền truy cập trang quản trị!'); 
        
        return <Navigate to="/" replace />;
    }

    // 4. Nếu là Admin -> Mời vào
    return <Outlet />;
};

export default PrivateRoute;