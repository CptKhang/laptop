import {
  CreditCard,
  MapPin,
  PackageCheck,
  Phone,
  Truck,
  UserRound,
  UserMinus,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";

const checkoutItems = [
  {
    id: 1,
    name: "MacBook Air M2 2022 13.6 inch 8GB/256GB",
    price: 26490000,
    quantity: 1,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/282827/apple-macbook-air-m2-2022-xanh-600x600.jpg",
  },
  {
    id: 2,
    name: "Asus TUF Gaming F15 FX506HF i5 11400H",
    price: 16990000,
    quantity: 1,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/269468/asus-tuf-gaming-fx506hf-i5-hn014w-600x600.jpg",
  },
];

function CheckoutPage() {
  const subtotal = checkoutItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shippingFee = 0;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f4f7ff]">
        <section className="mx-auto max-w-7xl px-6 py-10">
          {/* TITLE */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600">
              Hoàn tất đơn hàng
            </p>

            <h1 className="mt-2 text-4xl font-extrabold text-gray-900">
              Thanh toán
            </h1>

            <p className="mt-2 text-gray-500">
              Nhập thông tin giao hàng và chọn phương thức thanh toán.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            {/* LEFT */}
            <div className="space-y-8">
              {/* INFO */}
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b pb-4">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                    <UserRound size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">Thông tin giao hàng</h2>
                    <p className="text-sm text-gray-500">
                      Điền thông tin để nhận hàng
                    </p>
                  </div>
                </div>

                {/* Nút Không chính chủ được thêm vào đây */}
                <div className="mb-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <UserMinus size={16} />
                    Không chính chủ
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
                    placeholder="Họ và tên"
                  />
                  <input
                    className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
                    placeholder="Số điện thoại"
                  />

                  <div className="md:col-span-2">
                    <input
                      className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
                      placeholder="Địa chỉ giao hàng"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <textarea
                      rows={4}
                      className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
                      placeholder="Ghi chú (tuỳ chọn)"
                    />
                  </div>
                </div>
              </section>

              {/* PAYMENT */}
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3 border-b pb-4">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                    <CreditCard size={22} />
                  </div>
                  <h2 className="text-xl font-bold">
                    Phương thức thanh toán
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 rounded-xl border p-4 cursor-pointer hover:border-blue-500">
                    <input type="radio" name="payment" defaultChecked />
                    <div>
                      <p className="font-semibold">
                        Thanh toán khi nhận hàng (COD)
                      </p>
                      <p className="text-sm text-gray-500">
                        Trả tiền khi nhận sản phẩm
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border p-4 cursor-pointer hover:border-blue-500">
                    <input type="radio" name="payment" />
                    <div>
                      <p className="font-semibold">Chuyển khoản MoMo</p>
                      <p className="text-sm text-gray-500">
                        Thanh toán qua ví điện tử
                      </p>
                    </div>
                  </label>
                </div>
              </section>

              {/* SHIPPING */}
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                    <Truck size={22} />
                  </div>

                  <h2 className="text-xl font-bold">
                    Phương thức giao hàng
                  </h2>
                </div>

                <p className="mt-4 text-gray-600">
                  Giao hàng tiêu chuẩn (2-3 ngày)
                </p>
              </section>
            </div>

            {/* RIGHT */}
            <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold">Tóm tắt đơn hàng</h2>

              <div className="mt-6 space-y-4">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      className="h-14 w-14 rounded-lg object-contain"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        SL: {item.quantity}
                      </p>
                      <p className="text-blue-600 font-bold">
                        {item.price.toLocaleString("vi-VN")}₫
                      </p>
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
                  <span className="text-blue-700">
                    {total.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>

              <Link
                to="/order-success"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-4 font-bold text-white hover:bg-blue-800"
              >
                <PackageCheck size={18} />
                Đặt hàng
              </Link>

              <Link
                to="/cart"
                className="mt-3 block text-center text-blue-600"
              >
                Quay lại giỏ hàng
              </Link>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default CheckoutPage;