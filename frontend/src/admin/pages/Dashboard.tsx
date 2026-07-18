import { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          products: data.length || 0,
          orders: 0, // Sẽ tự nhảy khi có dữ liệu đơn hàng
          revenue: 0,
        });
      })
      .catch((err) => console.error("Lỗi lấy dữ liệu Dashboard:", err));
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