import { LayoutDashboard, ShoppingCart, Package, Users, FolderTree, Tag } from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md p-5 min-h-screen">
      <h1 className="text-xl font-bold text-blue-600 mb-6">
        Admin Panel
      </h1>

      <nav className="space-y-3">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded-xl font-semibold transition ${
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-blue-700"
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded-xl font-semibold transition ${
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-blue-700"
            }`
          }
        >
          <Package size={18} />
          Sản phẩm
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded-xl font-semibold transition ${
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-blue-700"
            }`
          }
        >
          <FolderTree size={18} />
          Danh mục
        </NavLink>

        {/* ✅ BỔ SUNG MỤC QUẢN LÝ THƯƠNG HIỆU */}
        <NavLink
          to="/admin/brands"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded-xl font-semibold transition ${
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-blue-700"
            }`
          }
        >
          <Tag size={18} />
          Thương hiệu
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded-xl font-semibold transition ${
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-blue-700"
            }`
          }
        >
          <ShoppingCart size={18} />
          Đơn hàng
        </NavLink>
        
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded-xl font-semibold transition ${
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-blue-700"
            }`
          }
        >
          <Users size={18} />
          Người dùng
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;