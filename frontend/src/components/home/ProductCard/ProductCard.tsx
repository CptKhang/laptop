import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
// 1. Import API Client
import { api } from "../../../utils/api";

export type ProductCardProps = {
  id: number | string;
  name: string;
  price: number | string;
  oldPrice?: number | string;
  image: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  discount?: string;
};

export default function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  discount,
}: ProductCardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 2. HÀM THÊM VÀO GIỎ HÀNG GỌI TRỰC TIẾP API BACKEND
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Chặn hành vi chuyển trang của thẻ Link bọc ngoài
    setLoading(true);

    try {
      // Endpoint chuẩn từ api.md: POST /cart/items[cite: 1]
      await api.post("/cart/items", {
        productId: Number(id),
        quantity: 1
      });

      alert(`Đã thêm "${name}" vào giỏ hàng thành công!`);
    } catch (err: any) {
      console.error("Lỗi khi thêm vào giỏ:", err);
      if (err.response?.status === 401) {
        alert("Vui lòng đăng nhập để sử dụng giỏ hàng.");
        navigate("/login");
      } else {
        const msg = err.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng.";
        alert(Array.isArray(msg) ? msg.join(", ") : msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link 
      to={`/products/${id}`} 
      className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-gray-100 p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="relative flex h-52 items-center justify-center rounded-2xl bg-gray-50 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="max-h-44 object-contain transition duration-300 group-hover:scale-105" 
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image'; }}
        />
        {discount && (
          <span className="absolute top-3 left-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
            {discount}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition">
            {name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-blue-700">
              {Number(price).toLocaleString("vi-VN")}₫
            </span>
            {oldPrice && (
              <span className="text-sm text-gray-400 line-through">
                {Number(oldPrice).toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 py-3 font-bold text-blue-700 transition hover:bg-blue-700 hover:text-white disabled:bg-gray-100 disabled:text-gray-400"
        >
          <ShoppingCart size={18} />
          {loading ? "Đang xử lý..." : "Thêm vào giỏ"}
        </button>
      </div>
    </Link>
  );
}