import { Navigate, Outlet } from 'react-router-dom';
import { useAuthState } from '../context/AuthContext';

const PrivateRoute = () => {
    const { isLoggedIn, user, isAuthLoading } = useAuthState();

    if (isAuthLoading) return null;

    // 2. Check 1: Chưa đăng nhập -> Đá về Login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // 3. Check 2: Đã đăng nhập nhưng KHÔNG PHẢI ADMIN -> Đá về Trang chủ
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    // 4. Nếu là Admin -> Mời vào
    return <Outlet />;
};

export default PrivateRoute;