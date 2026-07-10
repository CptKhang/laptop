import { LayoutDashboard, ShoppingCart, Package, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md p-5">
      <h1 className="text-xl font-bold text-blue-600 mb-6">
        Admin Panel
      </h1>

      <nav className="space-y-3">
        <NavLink
          to="/admin"
          className="flex items-center gap-2 p-2 rounded hover:bg-blue-50"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/products"
          className="flex items-center gap-2 p-2 rounded hover:bg-blue-50"
        >
          <Package size={18} />
          Sản phẩm
        </NavLink>

        <NavLink
          to="/admin/orders"
          className="flex items-center gap-2 p-2 rounded hover:bg-blue-50"
        >
          <ShoppingCart size={18} />
          Đơn hàng
        </NavLink>

        <NavLink
          to="/admin/users"
          className="flex items-center gap-2 p-2 rounded hover:bg-blue-50"
        >
          <Users size={18} />
          Người dùng
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;