import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  MapPin,
  PackageCheck,
  Phone,
  Truck,
  UserRound,
  UserMinus,
} from "lucide-react";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";

function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("techblue_cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingFee = 0;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    // ĐÃ SỬA: Đóng gói thêm items từ cartItems vào orderData
    const orderData = {
      receiverName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      note: formData.note,
      paymentMethod: paymentMethod,
      items: cartItems.map((item) => ({
        productId: Number(item.id),
        quantity: Number(item.quantity),
        // Ép kiểu price về Number ở đây
        price: Number(item.price), 
      })),
    };

    try {
      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        alert("Đặt hàng thành công!");
        localStorage.removeItem("techblue_cart"); // Xoá giỏ hàng sau khi đặt thành công
        navigate("/order-success");
      } else {
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
        alert(`Có lỗi xảy ra: ${errorData.message || "Vui lòng thử lại"}`);
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert("Không kết nối được tới server.");
    } finally {
      setLoading(false);
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input required name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none" placeholder="Họ và tên" />
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none" placeholder="Số điện thoại" />
                  <div className="md:col-span-2">
                    <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none" placeholder="Địa chỉ giao hàng" />
                  </div>
                  <div className="md:col-span-2">
                    <textarea rows={4} name="note" value={formData.note} onChange={handleInputChange} className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none" placeholder="Ghi chú (tuỳ chọn)" />
                  </div>
                </div>
              </section>

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
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} className="h-14 w-14 rounded-lg object-contain" alt={item.name} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                      <p className="text-blue-600 font-bold">{item.price.toLocaleString("vi-VN")}₫</p>
                    </div>
                  </div>
                ))}
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
                  <span className="text-blue-700">{total.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-4 font-bold text-white hover:bg-blue-800 disabled:bg-gray-400"
              >
                <PackageCheck size={18} />
                {loading ? "Đang xử lý..." : "Đặt hàng"}
              </button>

              <button type="button" onClick={() => navigate("/cart")} className="mt-3 block w-full text-center text-blue-600">
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