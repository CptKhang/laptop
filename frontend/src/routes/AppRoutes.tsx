import { BrowserRouter, Route, Routes } from "react-router-dom";
import CartPage from "../pages/Cart/CartPage";
import CheckoutPage from "../pages/Checkout/CheckoutPage";
import HomePage from "../pages/Home/HomePage";
import LoginPage from "../pages/Login/LoginPage";
import ProductDetailPage from "../pages/Products/ProductDetailPage";
import ProductListPage from "../pages/Products/ProductListPage";
import RegisterPage from "../pages/Register/RegisterPage";
import OrderSuccessPage from "../pages/OrderSuccess/OrderSuccessPage";
import AdminCategoriesPage from "../admin/pages/Categories";
import UserDetail from "../admin/pages/UserDetail";

// BỔ SUNG IMPORT TRANG PROFILE
// Lưu ý: Hãy đảm bảo đường dẫn import này khớp với vị trí bạn đã lưu file ProfilePage.tsx
import ProfilePage from "../pages/Profile/ProfilePage"; 
import CustomerOrderDetailPage from "../pages/Profile/CustomerOrderDetailPage";
// Imports hệ thống Admin
import AdminLayout from "../admin/layout/AdminLayout";
import Dashboard from "../admin/pages/Dashboard";
import AdminLoginPage from "../admin/pages/login/AdminLoginPage";
import Products from "../admin/pages/Products";
import Orders from "../admin/pages/Orders";
import OrderDetail from "../admin/pages/OrderDetail";
import Users from "../admin/pages/Users";
import AdminBrandsPage from "../admin/pages/Brands";


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
        
        {/* ✅ MỞ KHÓA ROUTE CHO PROFILE */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/orders/:id" element={<CustomerOrderDetailPage />} />
        {/* Lưu ý: Nếu bạn có xây dựng trang Chi tiết đơn hàng cho khách, bạn sẽ cần thêm Route này */}
        {/* <Route path="/profile/orders/:id" element={<CustomerOrderDetailPage />} /> */}

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/users/:id" element={<AdminLayout><UserDetail /></AdminLayout>} />
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
  path="/admin/categories"
  element={
    <AdminLayout>
      <AdminCategoriesPage />
    </AdminLayout>
  }
/>
<Route 
  path="/admin/brands" 
  element={
    <AdminLayout>
      <AdminBrandsPage />
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

        {/* ✅ LƯỚI AN TOÀN: Bắt mọi đường dẫn không tồn tại (Lỗi 404) */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
              <h1 className="text-6xl font-extrabold text-blue-700 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8 font-medium">Trang bạn đang tìm kiếm không tồn tại.</p>
              <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                Quay về Trang chủ
              </a>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;