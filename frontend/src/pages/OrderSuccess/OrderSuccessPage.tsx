import { CheckCircle, XCircle, Home, ShoppingBag, RefreshCcw } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Header from "../../components/layout/Header/Header";

function OrderResultPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // 1. Lấy mã đơn hàng (Hỗ trợ cả luồng COD và luồng MoMo)
  const orderFromState = (location.state as { order?: { id: number | string } })?.order;
  const orderIdFromUrl = searchParams.get("orderId");
  const finalOrderId = orderIdFromUrl || orderFromState?.id;
  const displayId = finalOrderId ? `#${finalOrderId}` : "Không tìm thấy mã đơn";

  // 2. Kiểm tra trạng thái thanh toán từ MoMo
  const resultCode = searchParams.get("resultCode");
  
  // Nếu có resultCode và nó khác '0', nghĩa là thanh toán thất bại
  const isFailed = resultCode !== null && resultCode !== "0";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f4f7ff]">
        <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
          
          {/* Phân nhánh Icon và Màu sắc */}
          <div className={`rounded-full p-6 ${isFailed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {isFailed ? <XCircle size={80} /> : <CheckCircle size={80} />}
          </div>

          {/* Phân nhánh Tiêu đề */}
          <h1 className="mt-6 text-4xl font-extrabold text-gray-900">
            {isFailed ? "Thanh toán thất bại!" : "Đặt hàng thành công!"}
          </h1>

          {/* Phân nhánh Lời nhắn */}
          <p className="mt-4 text-gray-600">
            {isFailed 
              ? "Rất tiếc, giao dịch của bạn không thể hoàn tất. Vui lòng thử lại." 
              : "Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý."}
          </p>

          <div className="mt-8 w-full rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Mã đơn hàng hệ thống</p>
            <p className={`mt-2 text-2xl font-extrabold ${isFailed ? 'text-red-700' : 'text-blue-700'}`}>
              {displayId}
            </p>
          </div>

          <div className="mt-10 flex gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl bg-gray-200 px-6 py-3 font-bold text-gray-700 transition hover:bg-gray-300"
            >
              <Home size={18} />
              Về trang chủ
            </Link>

            {/* Nếu thất bại thì hiện nút Thanh toán lại, nếu thành công thì hiện nút Mua sắm tiếp */}
            {isFailed ? (
              <Link
                to={`/checkout?retry=${finalOrderId}`}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
              >
                <RefreshCcw size={18} />
                Thanh toán lại
              </Link>
            ) : (
              <Link
                to="/products"
                className="flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
              >
                <ShoppingBag size={18} />
                Tiếp tục mua sắm
              </Link>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default OrderResultPage;