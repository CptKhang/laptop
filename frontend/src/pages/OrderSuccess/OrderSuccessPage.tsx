import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header/Header";

function OrderSuccessPage() {
  const orderCode = "TB" + Math.floor(Math.random() * 1000000);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f4f7ff]">
        <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
          <div className="rounded-full bg-green-100 p-6 text-green-600">
            <CheckCircle size={80} />
          </div>

          <h1 className="mt-6 text-4xl font-extrabold text-gray-900">
            Đặt hàng thành công!
          </h1>

          <p className="mt-4 text-gray-600">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </p>

          <div className="mt-8 w-full rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Mã đơn hàng</p>
            <p className="mt-2 text-2xl font-extrabold text-blue-700">
              {orderCode}
            </p>
          </div>

          <div className="mt-10 flex gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              <Home size={18} />
              Về trang chủ
            </Link>

            <Link
              to="/products"
              className="flex items-center gap-2 rounded-xl border border-blue-200 px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
            >
              <ShoppingBag size={18} />
              Tiếp tục mua sắm
            </Link>
          </div>

          <div className="mt-10 rounded-2xl bg-blue-50 p-5 text-sm text-blue-700">
            Hệ thống sẽ gửi email xác nhận đơn hàng và thông tin vận chuyển cho
            bạn trong thời gian sớm nhất.
          </div>
        </section>
      </main>
    </>
  );
}

export default OrderSuccessPage;