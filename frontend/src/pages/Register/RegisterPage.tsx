import { Eye, EyeOff, Lock, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// 1. Import Tầng Nền tảng
import { api } from "../../utils/api";

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2. Khởi tạo toàn bộ State để hứng dữ liệu đầu vào
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. Logic xử lý Đăng ký và Xác thực (Validation)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Chặn người dùng nếu chưa đồng ý điều khoản
    if (!agreed) {
      setError("Bạn phải đồng ý với điều khoản sử dụng và chính sách bảo mật.");
      return;
    }

    // Xác thực 2 mật khẩu khớp nhau ngay tại Frontend
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      // Gửi payload xuống Backend. Hãy đảm bảo đường dẫn /auth/register khớp với BE của bạn
      await api.post("/auth/register", {
        fullName,
        email,
        phone,
        password,
      });

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login"); // Đẩy về trang đăng nhập
    } catch (err: any) {
      console.error("Lỗi đăng ký:", err);
      const errorMessage = err.response?.data?.message || "Hệ thống đang bận. Không thể đăng ký tài khoản lúc này.";
      setError(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7ff]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
          {/* Left - Giao diện tĩnh giữ nguyên */}
          <div className="relative hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 p-10 text-white lg:block">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white" />
                  <h1 className="text-2xl font-extrabold">TechBlue Laptop</h1>
                </div>
                <div className="mt-20">
                  <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-bold">Tạo tài khoản mới</p>
                  <h2 className="text-4xl font-extrabold leading-tight">Mua sắm laptop dễ dàng, nhanh chóng và an toàn.</h2>
                  <p className="mt-5 text-blue-100">Đăng ký tài khoản để đặt hàng, theo dõi đơn hàng, đánh giá sản phẩm và gửi yêu cầu đổi/trả khi cần thiết.</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-blue-100">“Tài khoản của bạn giúp hệ thống lưu địa chỉ giao hàng, lịch sử mua hàng và hỗ trợ hậu mãi tốt hơn.”</p>
              </div>
            </div>
          </div>

          {/* Right - Form xử lý logic */}
          <div className="p-8 sm:p-12">
            <Link to="/" className="mb-8 inline-block text-sm font-semibold text-blue-700 hover:underline">
              ← Quay về trang chủ
            </Link>

            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Đăng ký tài khoản</h2>
              <p className="mt-2 text-gray-500">Nhập thông tin để tạo tài khoản mua sắm.</p>
            </div>

            {/* Hiển thị lỗi tổng */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Họ và tên</label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <UserRound size={18} className="text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    className="ml-3 w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email"
                    className="ml-3 w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Số điện thoại</label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <Phone size={18} className="text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="ml-3 w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Mật khẩu</label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <Lock size={18} className="text-gray-400" />
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

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Xác nhận mật khẩu</label>
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <Lock size={18} className="text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="ml-3 w-full bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-blue-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-blue-700" 
                />
                <span>
                  Tôi đồng ý với <span className="font-semibold text-blue-700">điều khoản sử dụng</span> và <span className="font-semibold text-blue-700">chính sách bảo mật</span>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white transition hover:bg-blue-800 disabled:bg-blue-400"
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link to="/login" className="font-bold text-blue-700 hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;