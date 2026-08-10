import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. Import Tầng Nền tảng
import { api } from "../../utils/api"; 

const ORDER_STATUSES = {
  PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  SHIPPING: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-800" },
  COMPLETED: { label: "Đã giao", color: "bg-green-100 text-green-800" }, // Đã đồng bộ COMPLETED khớp với backend
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" }
};

type Order = {
  id: string | number;
  total: number | string; // Total có thể là dạng chuỗi do Decimal
  status: keyof typeof ORDER_STATUSES;
};

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    // 2. Dùng Axios Client, bỏ qua việc gọi token thủ công
    api.get("/orders")
      .then((res) => {
        // Xử lý trường hợp backend trả về phân trang ({ items: [...] }) hoặc mảng thuần
        const dataList = Array.isArray(res.data) ? res.data : (res.data.items || []);
        
        const formattedData = dataList.map((item: any) => ({
          ...item,
          status: ORDER_STATUSES[item.status as keyof typeof ORDER_STATUSES] ? item.status : "PENDING"
        }));
        setOrders(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách đơn hàng:", err);
        setOrders([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // 3. Xử lý logic gọi API cập nhật trạng thái thực tế
  const handleStatusChange = async (orderId: string | number, newStatus: keyof typeof ORDER_STATUSES) => {
    const confirmChange = window.confirm(`Xác nhận chuyển trạng thái đơn hàng #${orderId} thành "${ORDER_STATUSES[newStatus].label}"?`);
    if (!confirmChange) return;

    try {
      // Gọi API thực tế xuống Backend (PATCH)
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      // Chỉ khi BE trả về thành công (2xx), mới cập nhật UI
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Lỗi hệ thống: Không thể cập nhật trạng thái.";
      alert(`Thất bại:\n${Array.isArray(errorMessage) ? errorMessage.join("\n") : errorMessage}`);
      
      // Rollback (khôi phục) lại trạng thái chuẩn từ DB nếu update lỗi
      loadOrders();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-medium">Đang tải dữ liệu...</div>
        ) : (
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
                    onClick={() => navigate(`/admin/orders/${String(o.id).replace('#', '')}`)}
                  >
                    <td className="p-4 font-bold text-blue-600 hover:underline">#{o.id}</td>
                    <td className="p-4 font-bold text-gray-700">
                      {Number(o.total)?.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block w-45">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as keyof typeof ORDER_STATUSES)}
                          // Khóa select nếu đơn hàng đã hoàn thành (COMPLETED) hoặc đã hủy (CANCELLED)
                          disabled={o.status === "COMPLETED" || o.status === "CANCELLED"}
                          className={`block w-full appearance-none rounded-full px-4 py-1.5 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${ORDER_STATUSES[o.status]?.color || 'bg-gray-100 text-gray-800'} ${["COMPLETED", "CANCELLED"].includes(o.status) ? 'cursor-not-allowed opacity-70' : ''}`}
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
        )}
      </div>
    </div>
  );
}

export default Orders;