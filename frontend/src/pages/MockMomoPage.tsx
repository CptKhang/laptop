import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export default function MockMomoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const [loading, setLoading] = useState(false);

  const handleSimulatePayment = async (isSuccess: boolean) => {
    setLoading(true);
    try {
      // Gửi tín hiệu giả lập Webhook (IPN) ngầm về Backend của bạn
      await api.post("/payment/mock-ipn", {
        orderId: orderId,
        amount: amount,
        resultCode: isSuccess ? 0 : 1006, // 0 là thành công, khác 0 là thất bại
        message: isSuccess ? "Giao dịch thành công" : "Giao dịch thất bại",
      });

      if (isSuccess) {
        alert("Thanh toán giả lập thành công!");
        navigate(`/order-success?orderId=${orderId}`);
      } else {
        alert("Thanh toán giả lập thất bại!");
        navigate("/checkout");
      }
    } catch (error) {
      console.error("Lỗi giả lập thanh toán:", error);
      alert("Có lỗi xảy ra khi gọi webhook nội bộ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        <div className="mb-4 inline-flex rounded-full bg-pink-100 p-4 text-pink-600 font-bold text-xl">
          MOMO MOCK
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800">Cổng Thanh Toán Giả Lập</h1>
        <p className="mt-2 text-sm text-gray-500">Mã đơn hàng: <span className="font-bold text-black">#{orderId}</span></p>
        <p className="text-sm text-gray-500">Số tiền: <span className="font-bold text-blue-600">{Number(amount || 0).toLocaleString("vi-VN")}₫</span></p>

        <div className="mt-8 space-y-3">
          <button
            disabled={loading}
            onClick={() => handleSimulatePayment(true)}
            className="w-full rounded-xl bg-pink-600 py-3 font-bold text-white hover:bg-pink-700 shadow-md transition-colors"
          >
            {loading ? "Đang xử lý..." : "Mô phỏng Thanh toán THÀNH CÔNG (0)"}
          </button>

          <button
            disabled={loading}
            onClick={() => handleSimulatePayment(false)}
            className="w-full rounded-xl bg-gray-300 py-3 font-bold text-gray-700 hover:bg-gray-400 transition-colors"
          >
            Mô phỏng Thanh toán THẤT BẠI
          </button>
        </div>
      </div>
    </div>
  );
}