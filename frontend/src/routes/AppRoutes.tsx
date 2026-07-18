import { BrowserRouter, Route, Routes } from "react-router-dom";
import CartPage from "../pages/Cart/CartPage";
import CheckoutPage from "../pages/Checkout/CheckoutPage";
import HomePage from "../pages/Home/HomePage";
import LoginPage from "../pages/Login/LoginPage";
import ProductDetailPage from "../pages/Products/ProductDetailPage";
import ProductListPage from "../pages/Products/ProductListPage";
import RegisterPage from "../pages/Register/RegisterPage";
import OrderSuccessPage from "../pages/OrderSuccess/OrderSuccessPage";

// Imports hệ thống Admin
import AdminLayout from "../admin/layout/AdminLayout";
import Dashboard from "../admin/pages/Dashboard";
import AdminLoginPage from "../admin/pages/Login/AdminLoginPage";
import Products from "../admin/pages/Products";
import Orders from "../admin/pages/Orders";
import OrderDetail from "../admin/pages/OrderDetail"; // <--- Import trang chi tiết
import Users from "../admin/pages/Users";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminLayout>
              <Products />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminLayout>
              <Orders />
            </AdminLayout>
          }
        />
        {/* Route chi tiết đơn hàng */}
        <Route
          path="/admin/orders/:id"
          element={
            <AdminLayout>
              <OrderDetail />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <Users />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;