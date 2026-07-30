import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Clock, XCircle, CheckCircle2 } from "lucide-react";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import { api } from "../../utils/api";

type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  price: string | number;
  product?: {
    id: number;
    name: string;
    image?: string;
  };
};

type StatusHistory = {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
  actor?: {
    fullName: string;
    role: string;
  };
};

type OrderDetail = {
  id: number;
  receiverName: string;
  phone: string;
  address: string;
  note: string | null;
  total: string | number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  createdAt: string;
  cancelReason: string | null;
  items?: OrderItem[];
};

function CustomerOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      // Gọi GET /orders/:id và GET /orders/:id/status-history theo api.md
      const [orderRes, historyRes] = await Promise.all([
        api.get(`/orders/${id}`),
        api.get(`/orders/${id}/status-history`)
      ]);
      setOrder(orderRes.data);
      setHistory(historyRes.data || []);
    } catch (err: any) {
      console.error("Lỗi tải chi tiết đơn hàng:", err);
      if (err.response?.status === 403 || err.response?.status === 404) {
        alert("Đơn hàng không tồn tại hoặc bạn không có quyền xem.");
        navigate("/profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  // Xử lý hủy đơn hàng (Chỉ PENDING mới hủy được theo api.md)
  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cancelReason.trim().length < 5) {
      alert("Lý do hủy phải có từ 5 đến 500 ký tự.");
      return;
    }

    setSubmitting(true);
    try {
      // Gọi POST /orders/:id/cancel theo api.md
      await api.post(`/orders/${id}/cancel`, { reason: cancelReason.trim() });
      alert("Đã hủy đơn hàng thành công!");
      setShowCancelModal(false);
      fetchOrderDetail(); // Tải lại thông tin đơn hàng
    } catch (err: any) {
      console.error("Lỗi hủy đơn:", err);
      const msg = err.response?.data?.message || "Không thể hủy đơn hàng này.";
      alert(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Đang tải chi tiết đơn hàng...</div>;
  }

  if (!order) return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f4f7ff] py-10">
        <div className="mx-auto max-w-4xl px-6">
          <button onClick={() => navigate("/profile")} className="mb-6 flex items-center gap-2 text-blue-700 font-semibold hover:underline">
            <ArrowLeft size={18} /> Quay lại danh sách đơn hàng
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
            {/* Tiêu đề & Trạng thái */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
              <div>
                <p className="text-sm text-gray-500">Chi tiết đơn hàng</p>
                <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Đơn hàng #{order.id}</h1>
                <p className="text-sm text-gray-500 mt-1">Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              <div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold inline-block ${
                  order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  Trạng thái: {order.status}
                </span>
              </div>
            </div>

            {/* Thông tin nhận hàng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Thông tin người nhận</h3>
                <p className="text-gray-700 font-semibold">{order.receiverName}</p>
                <p className="text-gray-600 text-sm mt-1">Điện thoại: {order.phone}</p>
                <p className="text-gray-600 text-sm mt-1">Địa chỉ: {order.address}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Thanh toán & Ghi chú</h3>
                <p className="text-gray-700 text-sm">Phương thức: <span className="font-bold">{order.paymentMethod}</span></p>
                <p className="text-gray-600 text-sm mt-1">Ghi chú: {order.note || "Không có"}</p>
                {order.cancelReason && (
                  <p className="text-red-600 text-sm mt-2 font-semibold">Lý do hủy: {order.cancelReason}</p>
                )}
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm trong đơn</h3>
              <div className="divide-y border-t border-b">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {item.product?.image && (
                        <img src={item.product.image} alt="" className="w-16 h-16 object-contain rounded-xl bg-gray-50 p-1" />
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{item.product?.name || `Sản phẩm #${item.productId}`}</p>
                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-extrabold text-blue-700">{Number(item.price).toLocaleString("vi-VN")}₫</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end items-center gap-6 mt-6 pt-4 border-t">
                <span className="text-lg font-bold text-gray-700">Tổng thanh toán:</span>
                <span className="text-3xl font-extrabold text-blue-700">{Number(order.total).toLocaleString("vi-VN")}₫</span>
              </div>
            </div>

            {/* Lịch sử trạng thái */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lịch sử xử lý đơn hàng</h3>
              <div className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                {history.map((h) => (
                  <div key={h.id} className="flex items-start gap-3 text-sm">
                    <Clock size={16} className="text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        Chuyển từ <span className="text-gray-500">{h.fromStatus || "Bắt đầu"}</span> sang <span className="text-blue-600">{h.toStatus}</span>
                      </p>
                      <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString("vi-VN")} bởi {h.actor?.fullName || "Hệ thống"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nút hủy đơn (Chỉ hiện khi PENDING) */}
            {order.status === 'PENDING' && (
              <div className="pt-4 border-t flex justify-end">
                <button 
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-sm"
                >
                  <XCircle size={18} /> Hủy đơn hàng
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal nhập lý do hủy đơn */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận hủy đơn hàng</h3>
              <p className="text-sm text-gray-500 mb-4">Vui lòng nhập lý do bạn muốn hủy đơn hàng này (tối thiểu 5 ký tự).</p>
              <form onSubmit={handleCancelOrder} className="space-y-4">
                <textarea 
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy..."
                  className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none text-sm"
                />
                <div className="flex gap-3 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 font-semibold text-gray-600 hover:bg-gray-200"
                  >
                    Đóng
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl bg-red-600 font-semibold text-white hover:bg-red-700 disabled:bg-red-300"
                  >
                    {submitting ? "Đang xử lý..." : "Xác nhận hủy"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default CustomerOrderDetailPage;