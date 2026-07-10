function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded shadow">
          Tổng sản phẩm
        </div>

        <div className="bg-white p-4 rounded shadow">
          Đơn hàng hôm nay
        </div>

        <div className="bg-white p-4 rounded shadow">
          Doanh thu
        </div>
      </div>
    </div>
  );
}

export default Dashboard;