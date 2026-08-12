import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "../../utils/api";

// 1. Định nghĩa khuôn mẫu dữ liệu (TypeScript)
interface CartContextType {
  cartCount: number;
  fetchCartCount: () => Promise<void>; // Hàm để các Component khác gọi khi muốn update giỏ hàng
}

// 2. Khởi tạo Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 3. Xây dựng Provider (Lớp bọc cung cấp dữ liệu)
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  // Hàm gọi API lấy tổng số lượng sản phẩm trong giỏ của user hiện tại
  const fetchCartCount = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setCartCount(0);
      return;
    }
    
    try {
      const res = await api.get("/cart/count"); // Giả sử Backend của bạn có API này
      // Nếu API trả về { totalItems: 5 }
      setCartCount(res.data.totalItems || 0);
    } catch (error) {
      console.error("Lỗi đồng bộ giỏ hàng:", error);
    }
  };

  // Tự động đồng bộ số lượng khi người dùng tải lại trang (F5)
  useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

// 4. Custom Hook để sử dụng nhanh, chống dính lỗi undefined
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart phải được sử dụng bên trong CartProvider");
  }
  return context;
};