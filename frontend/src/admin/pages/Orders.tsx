import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Định nghĩa bộ trạng thái chuẩn
const ORDER_STATUSES = {
  PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  SHIPPING: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" }
};

// Chuẩn hóa kiểu dữ liệu, tuyệt đối không dùng 'any'
type Order = {
  id: string | number;
  total: number;
  status: keyof typeof ORDER_STATUSES;
};

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:3000/orders", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Đảm bảo map đúng trạng thái mặc định nếu BE chưa trả về chuẩn
        const formattedData = Array.isArray(data) ? data.map(item => ({
          ...item,
          status: ORDER_STATUSES[item.status as keyof typeof ORDER_STATUSES] ? item.status : "PENDING"
        })) : [];
        setOrders(formattedData);
      })
      .catch((err) => {
        console.error("Lỗi fetch orders:", err);
        setOrders([]);
      });
  }, []);

  // Xử lý đổi trạng thái thuần Frontend (Mocking UI)
  const handleStatusChange = (orderId: string | number, newStatus: keyof typeof ORDER_STATUSES) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    console.warn(`[TODO]: Đơn hàng ${orderId} chuyển sang ${newStatus}. Bạn đang nợ BE logic chỗ này.`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600">Mã đơn</th>
              <th className="p-4 font-semibold text-gray-600">Tổng thanh toán</th>
              <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-400">Hiện tại chưa có đơn hàng nào</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b hover:bg-gray-50 cursor-pointer transition"
                  // Bấm vào hàng sẽ chuyển trang
                  onClick={() => navigate(`/admin/orders/${String(o.id).replace('#', '')}`)}
                >
                  <td className="p-4 font-bold text-blue-600 hover:underline">#{o.id}</td>
                  <td className="p-4 font-bold text-gray-700">
                    {Number(o.total)?.toLocaleString("vi-VN")}₫
                  </td>
                  {/* Bắt buộc phải có onClick với e.stopPropagation() để chặn hành vi nhấp chuột truyền ngược lên thẻ <tr> */}
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block w-40">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as keyof typeof ORDER_STATUSES)}
                        disabled={o.status === "DELIVERED" || o.status === "CANCELLED"}
                        className={`block w-full appearance-none rounded-full px-4 py-1.5 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${ORDER_STATUSES[o.status].color} ${["DELIVERED", "CANCELLED"].includes(o.status) ? 'cursor-not-allowed opacity-70' : ''}`}
                      >
                        {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
                          <option key={key} value={key} className="bg-white text-gray-800">
                            {label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;