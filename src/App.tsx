import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from './router/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';

import CategoryPage from './pages/admin/CategoryPage';
import AdminProductPage from './pages/admin/ProductPage';
import OrderPage from './pages/admin/OrderPage';
import AdminDashboard from './pages/admin/AdminDashboard';

import HomePage from './pages/public/HomePage';
import CartPage from './pages/public/CartPage';
import OrderHistoryPage from './pages/public/OrderHistoryPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import ClientProductPage from './pages/public/ClientProductPage';

import MainLayout from './components/layout/MainLayout';
import PublicLayout from './components/layout/PublicLayout';

import PaymentResult from './pages/public/PaymentResult';
import BannerPage from './pages/admin/BannerPage';
import DiscountPage from './pages/admin/DiscountPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* ========================================================= */}
        {/* 1. KHU VỰC CÔNG KHAI (STOREFRONT) */}
        {/* ========================================================= */}
        <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="products" element={<ClientProductPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/my-orders" element={<OrderHistoryPage />} />
            <Route path="/cart" element={<CartPage />} />
        </Route>


        {/* ========================================================= */}
        {/* 2. KHU VỰC LOGIN */}
        {/* ========================================================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/payment-result" element={<PaymentResult />} />

        {/* ========================================================= */}
        {/* 3. KHU VỰC QUẢN TRỊ (BACKOFFICE) - Phải có Token mới vào */}
        {/* ========================================================= */}
        {/* Lưu ý: Tôi thêm tiền tố "/admin" để phân biệt với trang khách */}
        
        <Route path="/admin" element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
                <Route index element={<AdminDashboard />} /> {/* /admin */}
                <Route path="products" element={<AdminProductPage />} /> {/* /admin/products */}
                <Route path="categories" element={<CategoryPage />} />
                <Route path="orders" element={<OrderPage />} /> {/* /admin/orders */}
                <Route path="banners" element={<BannerPage />} /> {/* /admin/banners */}
                <Route path="discounts" element={<DiscountPage />} /> {/* /admin/discounts */}
            </Route>
        </Route>


        {/* 4. Nếu gõ link bậy bạ -> Về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;