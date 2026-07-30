import { useEffect, useState } from "react";
// 1. Import instance api đã được cấu hình tự động gắn token
import { api } from "../../utils/api"; 

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    // 2. Gọi đúng Endpoint chuyên dụng của Admin Dashboard
    api.get("/admin/dashboard")
      .then((res) => {
        const data = res.data;
        // 3. Khớp nối đúng tên biến do backend trả về và ép kiểu Decimal
        setStats({
          products: data.totalProducts || 0,
          orders: data.todayOrders || 0,
          revenue: Number(data.totalRevenue) || 0, 
        });
      })
      .catch((err) => {
        console.error("Lỗi lấy dữ liệu Dashboard:", err);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400 font-medium">Tổng sản phẩm</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">{stats.products}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400 font-medium">Đơn hàng hôm nay</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.orders}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400 font-medium">Doanh thu</p>
          <h3 className="text-3xl font-bold text-orange-600 mt-2">
            {stats.revenue.toLocaleString("vi-VN")}₫
          </h3>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;