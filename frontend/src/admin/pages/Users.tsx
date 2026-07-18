import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/users")
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Lỗi fetch users:", err);
        setUsers([]);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý người dùng</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
                <td colSpan={3} className="p-8 text-center text-gray-400">Không có dữ liệu người dùng</td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-800">{u.fullName}</td>
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
      </div>
    </div>
  );
}

export default Users;