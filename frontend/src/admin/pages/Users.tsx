import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Import Tầng Nền tảng
import { api } from "../../utils/api"; 

type User = {
  id: string | number;
  fullName: string;
  email: string;
  role: "ADMIN" | "CUSTOMER" | string;
};

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/users")
      .then((res) => {
        const dataList = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setUsers(dataList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách người dùng:", err);
        setError("Không thể tải danh sách người dùng hoặc bạn không có quyền truy cập.");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý người dùng</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-medium">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-bold bg-red-50">{error}</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold text-gray-600">Tên người dùng</th>
                <th className="p-4 font-semibold text-gray-600">Địa chỉ Email</th>
                <th className="p-4 font-semibold text-gray-600">Quyền hạn</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400">Hệ thống chưa có người dùng nào</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr 
                    key={u.id} 
                    // Truyền nguyên cục object user qua state để trang chi tiết nhận luôn
                    onClick={() => navigate(`/admin/users/${u.id}`, { state: { user: u } })}
                    className="border-b hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="p-4 font-semibold text-blue-600 hover:underline">{u.fullName}</td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                        {u.role}
                      </span>
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

export default Users;