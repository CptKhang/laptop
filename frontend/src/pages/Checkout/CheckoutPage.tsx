import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  PackageCheck,
  UserRound,
} from "lucide-react";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";
// 1. Import Tầng Nền tảng
import { api } from "../../utils/api";

function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  
  // ==========================================
  // KHỐI LOGIC MỚI: QUẢN TRỊ TRẠNG THÁI THÔNG TIN GIAO HÀNG
  // ==========================================
  
  // 1. Master Data: Giả lập lấy thông tin từ Profile
  const currentUser = {
    email: "lekhang@gmail.com",
    fullName: "Khang",
    phone: "0982456345",
    address: ""
  };

  // 2. State cờ hiệu chuyển đổi người nhận
  const [isBuyingForSomeoneElse, setIsBuyingForSomeoneElse] = useState(false);

  // 3. Transactional Data: Khởi tạo với dữ liệu gốc của User
  const [formData, setFormData] = useState({
    fullName: currentUser.fullName,
    phone: currentUser.phone,
    address: currentUser.address,
    note: "",
  });

  // 4. Trigger đồng bộ dữ liệu khi bật/tắt nút Toggle
  useEffect(() => {
    if (!isBuyingForSomeoneElse) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.fullName,
        phone: currentUser.phone,
        address: currentUser.address,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        fullName: "",
        phone: "",
        address: "",
      }));
    }
  }, [isBuyingForSomeoneElse]);

  // 5. Chốt chặn Validation
  const isFormValid = 
    formData.fullName.trim() !== "" && 
    formData.phone.trim() !== "" && 
    formData.address.trim() !== "";

  // ==========================================
  // KHỐI LOGIC CŨ 
  // ==========================================

  // Đồng bộ lấy giỏ hàng từ Server
  useEffect(() => {
    const fetchCartForCheckout = async () => {
      try {
        const response = await api.get("/cart");
        setCartItems(response.data?.items || []);
      } catch (err) {
        console.error("Lỗi tải giỏ hàng cho checkout:", err);
      }
    };
    fetchCartForCheckout();
  }, []);

  // Tính toán tổng tiền
  const subtotal = cartItems.reduce((total, item) => {
    const price = Number(item.product?.price || item.price || 0);
    const qty = Number(item.quantity || 0);
    return total + price * qty;
  }, 0);

  const shippingFee = 0;
  const discount = 0;
  const totalAmount = subtotal + shippingFee - discount; // Đổi tên biến để tránh trùng lặp

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e: any) => {
    setPaymentMethod(e.target.value);
  };

  // ==========================================
  // BỘ ĐỊNH TUYẾN THANH TOÁN MỚI
  // ==========================================
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!isFormValid) return alert("Vui lòng điền đầy đủ thông tin giao hàng!");

    setLoading(true);

    const orderData = {
      receiverName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      note: formData.note,
      paymentMethod: paymentMethod,
      items: cartItems.map((item) => ({
        productId: Number(item.productId || item.product?.id || item.id),
        quantity: Number(item.quantity),
      })),
    };

    try {
      // BƯỚC 1: Luôn phải lưu đơn hàng vào Database trước để lấy Order ID
      const response = await api.post("/orders", orderData);
      const createdOrder = response.data;

      // BƯỚC 2: RẼ NHÁNH XỬ LÝ THEO PHƯƠNG THỨC THANH TOÁN
      if (paymentMethod === "MOMO") {
        // Giao tiếp với cổng Backend MoMo
        const momoResponse = await api.post("/payment/create-momo", {
          orderId: String(createdOrder.id), // Ép kiểu chuỗi theo đúng format Backend yêu cầu
          amount: totalAmount
        });

        // ĐÁ TRÌNH DUYỆT VĂNG KHỎI TRANG WEB CỦA BẠN SANG MOMO
        if (momoResponse.data && momoResponse.data.payUrl) {
          window.location.href = momoResponse.data.payUrl;
          return; // Lệnh return này TỬ HUYỆT: Chặn đứng không cho chạy xuống đoạn navigate bên dưới
        } else {
          alert("Lỗi: Không lấy được đường dẫn thanh toán từ MoMo.");
          setLoading(false);
          return;
        }
      }

      // BƯỚC 3: Dành riêng cho phương thức COD (Thanh toán tiền mặt)
      alert("Đặt hàng thành công!");
      navigate("/order-success", { state: { order: createdOrder } });
      
    } catch (error: any) {
      console.error("Lỗi đặt hàng:", error);
      const errorMessage = error.response?.data?.message || "Không thể kết nối đến server. Vui lòng thử lại.";
      alert(`Có lỗi xảy ra: ${Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage}`);
      setLoading(false); // Đảm bảo nhả nút submit nếu có lỗi
    } 
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f4f7ff]">
        <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600">Hoàn tất đơn hàng</p>
            <h1 className="mt-2 text-4xl font-extrabold text-gray-900">Thanh toán</h1>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b pb-4">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                    <UserRound size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Thông tin giao hàng</h2>
                    <p className="text-sm text-gray-500">Điền thông tin để nhận hàng</p>
                  </div>
                </div>

                {/* Block Hiển thị Email cố định */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Địa chỉ Email (Không thể thay đổi)</label>
                  <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                    ✉️ {currentUser.email}
                  </div>
                </div>

                {/* Khối Toggle Mua cho người khác */}
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={isBuyingForSomeoneElse}
                      onChange={(e) => setIsBuyingForSomeoneElse(e.target.checked)}
                    />
                    <span className="font-semibold text-blue-800">
                      Tôi muốn mua cho người khác
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input required name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none" placeholder="Họ và tên" />
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none" placeholder="Số điện thoại" />
                  <div className="md:col-span-2">
                    <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none" placeholder="Địa chỉ giao hàng chi tiết" />
                  </div>
                  <div className="md:col-span-2">
                    <textarea rows={4} name="note" value={formData.note} onChange={handleInputChange} className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none" placeholder="Ghi chú (tuỳ chọn)" />
                  </div>
                </div>
              </section>

              {/* Phần Phương thức thanh toán */}
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3 border-b pb-4">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                    <CreditCard size={22} />
                  </div>
                  <h2 className="text-xl font-bold">Phương thức thanh toán</h2>
                </div>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 rounded-xl border p-4 cursor-pointer hover:border-blue-500">
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={handlePaymentChange} />
                    <div>
                      <p className="font-semibold">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-500">Trả tiền khi nhận sản phẩm</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border p-4 cursor-pointer hover:border-blue-500">
                    <input type="radio" name="payment" value="MOMO" checked={paymentMethod === "MOMO"} onChange={handlePaymentChange} />
                    <div>
                      <p className="font-semibold">Chuyển khoản MoMo</p>
                      <p className="text-sm text-gray-500">Thanh toán qua ví điện tử</p>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold">Tóm tắt đơn hàng</h2>
              <div className="mt-6 space-y-4">
                {cartItems.map((item) => {
                  const product = item.product || item;
                  return (
                    <div key={item.id} className="flex gap-3 items-center">
                      <img src={product.image} className="h-14 w-14 rounded-lg object-contain bg-gray-50 p-1" alt={product.name} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                        <p className="text-blue-600 font-bold">{Number(product.price || 0).toLocaleString("vi-VN")}₫</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 border-t pt-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng tiền</span>
                  <span className="text-blue-700">{totalAmount.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0 || !isFormValid}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-4 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md transition-colors"
              >
                <PackageCheck size={18} />
                {loading ? "Đang xử lý đơn..." : "Đặt hàng"}
              </button>

              <button type="button" onClick={() => navigate("/cart")} className="mt-3 block w-full text-center text-blue-600 hover:underline text-sm font-semibold">
                Quay lại giỏ hàng
              </button>
            </aside>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}

export default CheckoutPage;