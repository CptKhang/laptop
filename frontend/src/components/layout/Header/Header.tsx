import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  // Đã xóa bỏ hoàn toàn state cartCount giả mạo

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);

    const fetchMenuData = async () => {
      try {
        const catRes = await api.get("/categories");
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu menu:", err);
      }
    };

    fetchMenuData();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
            B
          </div>
          <h1 className="text-2xl font-extrabold text-blue-800 tracking-tight">
            BeeTech
          </h1>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl mx-8 relative hidden md:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Tìm kiếm laptop (Bấm Enter để tìm)..."
            className="w-full px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>

        {/* Menu động */}
        <nav className="hidden lg:flex items-center gap-6 text-gray-600 font-medium text-sm">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/products?categoryId=${cat.id}`} 
              className="hover:text-blue-700 transition"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-5 ml-6">
          <button className="text-gray-500 hover:text-blue-700 transition text-xl">
            🔔
          </button>
          
          {/* KHỐI GIỎ HÀNG: Đã xóa hoàn toàn chấm đỏ hiển thị số lượng */}
          <Link to="/cart" className="text-gray-500 hover:text-blue-700 transition text-xl relative flex items-center">
            🛒
          </Link>

          {isLoggedIn ? (
            <Link to="/profile" className="text-gray-500 hover:text-blue-700 transition text-xl flex items-center bg-blue-50 p-2 rounded-full">
              👤
            </Link>
          ) : (
            <Link to="/login" className="text-gray-500 hover:text-blue-700 transition text-xl flex items-center">
              👤
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;