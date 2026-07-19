import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cơ chế đóng Dropdown khi click ra ngoài vùng menu (UX Standard)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn kết thúc phiên làm việc?")) {
      // 1. Phá hủy phiên làm việc ở Frontend (BẮT BUỘC)
      localStorage.removeItem("token");
      // Xóa thêm các state khác nếu có (ví dụ: localStorage.removeItem("userInfo"))

      // 2. Điều hướng về trang đăng nhập
      navigate("/admin/login");
    }
  };

  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6 relative">
      <h2 className="font-semibold text-gray-700">
        Admin Dashboard
      </h2>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">
          Xin chào Admin 👋
        </div>
        
        {/* Vùng chứa Icon và Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Tài khoản"
          >
            {/* SVG User Icon */}
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {/* Menu Dropdown hiển thị khi click */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 transition"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;