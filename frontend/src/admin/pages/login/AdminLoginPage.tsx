import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Hỗ trợ mọi kiểu trả về của Backend: access_token, accessToken, hoặc token
        const tokenReal = data.access_token || data.accessToken || data.token;
        
        if (tokenReal) {
          localStorage.setItem("token", tokenReal);
          navigate("/admin");
        } else {
          console.error("Cấu trúc phản hồi từ Backend:", data);
          alert("Đăng nhập thành công nhưng không tìm thấy token trong dữ liệu trả về từ Backend!");
        }
      } else {
        alert(data.message || "Sai tài khoản hoặc mật khẩu!");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối đến server backend.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Admin Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Mật khẩu</label>
            <input
              type="password"
              className="w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition"
          >
            Đăng nhập
          </button>
        </form>
        <p className="text-xs text-center text-gray-400 mt-5">
          Admin system - TechBlue Laptop
        </p>
      </div>
    </div>
  );
}

export default AdminLoginPage;