import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <div className="w-10 h-10 bg-blue-600 rounded-lg"></div>
          <h1 className="text-xl font-bold text-blue-600">
            TechBlue Laptop
          </h1>
        </Link>

        {/* Search */}
        <div className="flex-1 mx-6">
          <input
            type="text"
            placeholder="Tìm kiếm laptop..."
            className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Menu */}
        <nav className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
          <Link to="/products" className="hover:text-blue-600">Gaming</Link>
          <Link to="/products" className="hover:text-blue-600">Văn phòng</Link>
          <Link to="/products" className="hover:text-blue-600">Sinh viên</Link>
          <Link to="/products" className="hover:text-blue-600">Đồ họa</Link>

          {/* ✅ MENU MỚI */}
          <Link to="/products" className="hover:text-blue-600 font-semibold text-blue-600">
            Cao Cấp
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4 ml-6">
          <button className="hover:text-blue-600 text-lg">🔔</button>
          <Link to="/cart" className="hover:text-blue-600 text-lg flex items-center">🛒</Link>
          <Link to="/login" className="hover:text-blue-600 text-lg flex items-center">👤</Link>
        </div>

      </div>
    </header>
  );
};

export default Header;