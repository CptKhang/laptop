import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";

const cartItems = [
  {
    id: 1,
    name: "MacBook Air M2 2022 13.6 inch 8GB/256GB",
    price: 26490000,
    quantity: 1,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/282827/apple-macbook-air-m2-2022-xanh-600x600.jpg",
    cpu: "Apple M2",
    ram: "8GB RAM",
    storage: "256GB SSD",
  },
  {
    id: 2,
    name: "Asus TUF Gaming F15 FX506HF i5 11400H",
    price: 16990000,
    quantity: 1,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/269468/asus-tuf-gaming-fx506hf-i5-hn014w-600x600.jpg",
    cpu: "Intel Core i5",
    ram: "8GB RAM",
    storage: "512GB SSD",
  },
];

function CartPage() {
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f4f7ff]">
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8">
            <p className="font-bold text-blue-700">Giỏ hàng của bạn</p>

            <h1 className="mt-2 text-4xl font-extrabold text-gray-900">
              Giỏ hàng
            </h1>

            <p className="mt-2 text-gray-500">
              Kiểm tra sản phẩm trước khi tiến hành thanh toán.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                  <ShoppingBag size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Sản phẩm đã chọn
                  </h2>

                  <p className="text-sm text-gray-500">
                    Có {cartItems.length} sản phẩm trong giỏ hàng.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-5 rounded-2xl border border-gray-100 p-4 sm:grid-cols-[140px_1fr_auto]"
                  >
                    <Link
                      to={`/products/${item.id}`}
                      className="flex h-32 items-center justify-center rounded-2xl bg-blue-50"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-24 object-contain"
                      />
                    </Link>

                    <div>
                      <Link
                        to={`/products/${item.id}`}
                        className="text-lg font-extrabold text-gray-900 hover:text-blue-700"
                      >
                        {item.name}
                      </Link>

                      <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
                        <span className="rounded-lg bg-gray-50 px-3 py-2">
                          ⚙ {item.cpu}
                        </span>

                        <span className="rounded-lg bg-gray-50 px-3 py-2">
                          💾 {item.ram}
                        </span>

                        <span className="rounded-lg bg-gray-50 px-3 py-2">
                          🖥 {item.storage}
                        </span>
                      </div>

                      <p className="mt-4 text-2xl font-extrabold text-blue-700">
                        {item.price.toLocaleString("vi-VN")}₫
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                      <button className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
                        <Trash2 size={20} />
                      </button>

                      <div className="flex items-center rounded-xl border border-gray-200">
                        <button className="p-3 hover:text-blue-700">
                          <Minus size={16} />
                        </button>

                        <span className="px-4 font-bold">{item.quantity}</span>

                        <button className="p-3 hover:text-blue-700">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Tóm tắt đơn hàng
              </h2>

              <div className="mt-6 space-y-4 border-b border-gray-100 pb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-bold text-gray-900">
                    {subtotal.toLocaleString("vi-VN")}₫
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-bold text-green-600">Miễn phí</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Giảm giá</span>
                  <span className="font-bold text-gray-900">0₫</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  Tổng cộng
                </span>

                <span className="text-3xl font-extrabold text-blue-700">
                  {total.toLocaleString("vi-VN")}₫
                </span>
              </div>

              <Link
                to="/checkout"
                className="mt-8 block rounded-xl bg-blue-700 py-4 text-center font-bold text-white transition hover:bg-blue-800"
              >
                Tiến hành thanh toán
              </Link>

              <Link
                to="/products"
                className="mt-4 block rounded-xl border border-blue-200 py-4 text-center font-bold text-blue-700 transition hover:bg-blue-50"
              >
                Tiếp tục mua hàng
              </Link>

              <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
                Đơn hàng từ 10.000.000₫ được miễn phí giao hàng toàn quốc.
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default CartPage;