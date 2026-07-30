import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// 1. Import Tầng Nền tảng
import { api } from "../../utils/api";

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  // 2. Khởi tạo State để kiểm soát dữ liệu đầu vào
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. Hàm xử lý luồng Đăng nhập thực tế
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn hành vi tải lại trang mặc định của Form
    setLoading(true);
    setError(null);

    try {
      // Đảm bảo endpoint này khớp với tài liệu API Backend của bạn (ví dụ: /auth/login hoặc /users/login)
      const response = await api.post("/auth/login", { email, password });
      
      // 4. Lưu Khóa (Token) đúng chuẩn tên mà hệ thống Admin và Axios đang dùng
      const token = response.data?.access_token || response.data?.token;
      
      if (!token) {
        throw new Error("Backend không trả về Token đăng nhập.");
      }

      localStorage.setItem("access_token", token);
      
      alert("Đăng nhập thành công!");
      navigate("/"); // Đẩy người dùng về trang chủ
      
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err);
      // Xử lý thông báo lỗi từ Backend
      const errorMessage = err.response?.data?.message || "Sai email hoặc mật khẩu. Vui lòng thử lại.";
      setError(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7ff]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
          {/* Left - Giữ nguyên giao diện tĩnh của bạn */}
          <div className="relative hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 p-10 text-white lg:block">
             {/* ... (Các hiệu ứng background và chữ của bạn giữ nguyên, tôi thu gọn để tập trung vào logic) ... */}
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white" />
                  <h1 className="text-2xl font-extrabold">TechBlue Laptop</h1>
                </div>
                <div className="mt-20">
                  <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-bold">Chào mừng trở lại</p>
                  <h2 className="text-4xl font-extrabold leading-tight">Đăng nhập để tiếp tục mua sắm laptop yêu thích.</h2>
                  <p className="mt-5 text-blue-100">Quản lý đơn hàng, theo dõi trạng thái giao hàng, đánh giá sản phẩm và gửi yêu cầu đổi/trả dễ dàng.</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-blue-100">“Nền tảng mua sắm laptop trực tuyến tiện lợi, nhanh chóng và an toàn.”</p>
              </div>
            </div>
          </div>

          {/* Right - Form xử lý */}
          <div className="p-8 sm:p-12">
            <Link to="/" className="mb-8 inline-block text-sm font-semibold text-blue-700 hover:underline">
              ← Quay về trang chủ
            </Link>

            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Đăng nhập</h2>
              <p className="mt-2 text-gray-500">Nhập thông tin tài khoản để truy cập hệ thống.</p>
            </div>

            {/* 5. Hiển thị thông báo lỗi nếu có */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-semibold">
                {error}
              </div>
            )}

            {/* 6. Gắn sự kiện onSubmit vào Form */}
            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <Mail size={18} className="text-gray-400" />
                  {/* Gắn State vào input */}
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    className="ml-3 w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Mật khẩu</label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <Lock size={18} className="text-gray-400" />
                  {/* Gắn State vào input */}
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="ml-3 w-full bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-blue-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                  <input type="checkbox" className="h-4 w-4 accent-blue-700" />
                  Ghi nhớ đăng nhập
                </label>
                <button type="button" className="font-semibold text-blue-700 hover:underline">
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white transition hover:bg-blue-800 disabled:bg-blue-400"
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="font-bold text-blue-700 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;