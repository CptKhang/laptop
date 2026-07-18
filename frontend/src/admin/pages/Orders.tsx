import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import hook này

function Orders() {
  const navigate = useNavigate(); // Khai báo hook
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/orders", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Lỗi fetch orders:", err);
        setOrders([]);
      });
  }, []);

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
              orders.map((o: any) => (
                <tr 
                  key={o.id} 
                  className="border-b hover:bg-gray-100 cursor-pointer transition" // Thêm class này để hiện hiệu ứng bấm
                  onClick={() => navigate(`/admin/orders/${o.id}`)} // Bấm vào là sang trang chi tiết
                >
                  <td className="p-4 font-bold text-blue-600 underline">#{o.id}</td>
                  <td className="p-4 font-bold text-gray-700">{Number(o.total)?.toLocaleString("vi-VN")}₫</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                      {o.status || "Chờ xử lý"}
                    </span>
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