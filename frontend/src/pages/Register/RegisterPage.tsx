import { Eye, EyeOff, Lock, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7ff]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
          {/* Left */}
          <div className="relative hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 p-10 text-white lg:block">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white" />
                  <h1 className="text-2xl font-extrabold">
                    TechBlue Laptop
                  </h1>
                </div>

                <div className="mt-20">
                  <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-bold">
                    Tạo tài khoản mới
                  </p>

                  <h2 className="text-4xl font-extrabold leading-tight">
                    Mua sắm laptop dễ dàng, nhanh chóng và an toàn.
                  </h2>

                  <p className="mt-5 text-blue-100">
                    Đăng ký tài khoản để đặt hàng, theo dõi đơn hàng, đánh giá
                    sản phẩm và gửi yêu cầu đổi/trả khi cần thiết.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-blue-100">
                  “Tài khoản của bạn giúp hệ thống lưu địa chỉ giao hàng, lịch
                  sử mua hàng và hỗ trợ hậu mãi tốt hơn.”
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="p-8 sm:p-12">
            <Link
              to="/"
              className="mb-8 inline-block text-sm font-semibold text-blue-700 hover:underline"
            >
              ← Quay về trang chủ
            </Link>

            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Đăng ký tài khoản
              </h2>
              <p className="mt-2 text-gray-500">
                Nhập thông tin để tạo tài khoản mua sắm.
              </p>
            </div>

            <form className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Họ và tên
                </label>

                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <UserRound size={18} className="text-gray-400" />

                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    className="ml-3 w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <Mail size={18} className="text-gray-400" />

                  <input
                    type="email"
                    placeholder="Nhập email"
                    className="ml-3 w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Số điện thoại
                </label>

                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <Phone size={18} className="text-gray-400" />

                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    className="ml-3 w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Mật khẩu
                </label>

                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <Lock size={18} className="text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Xác nhận mật khẩu
                </label>

                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                  <Lock size={18} className="text-gray-400" />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    className="ml-3 w-full bg-transparent outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="text-gray-400 hover:text-blue-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-600">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-blue-700" />
                <span>
                  Tôi đồng ý với{" "}
                  <button
                    type="button"
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    điều khoản sử dụng
                  </button>{" "}
                  và{" "}
                  <button
                    type="button"
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    chính sách bảo mật
                  </button>
                  .
                </span>
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white transition hover:bg-blue-800"
              >
                Đăng ký
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-700 hover:underline"
              >
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