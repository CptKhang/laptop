import { useState, useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";

const STORAGE_KEY = "techblue_cart";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Đọc dữ liệu từ localStorage sử dụng đúng key: techblue_cart
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Lỗi khi đọc giỏ hàng:", error);
      }
    }
    setLoading(false);
  }, []);

  // Hàm cập nhật giỏ hàng khi tăng/giảm số lượng
  const updateQuantity = (id, change) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCartItems(updatedCart);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));
  };

  // Hàm xóa sản phẩm
  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 0),
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
            <h1 className="mt-2 text-4xl font-extrabold text-gray-900">Giỏ hàng</h1>
          </div>

          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl">Đang tải dữ liệu...</div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl">
              <h2 className="text-xl font-bold text-gray-700">Giỏ hàng của bạn đang trống</h2>
              <Link to="/products" className="text-blue-700 underline mt-4 block font-semibold hover:text-blue-800">
                Tiếp tục mua hàng
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Sản phẩm đã chọn</h2>
                    <p className="text-sm text-gray-500">Có {cartItems.length} sản phẩm.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {cartItems.map((item) => (
                    <div key={item.id} className="grid gap-5 rounded-2xl border border-gray-100 p-4 sm:grid-cols-[140px_1fr_auto]">
                      <Link to={`/products/${item.id}`} className="flex h-32 items-center justify-center rounded-2xl bg-blue-50">
                        <img src={item.image} alt={item.name} className="max-h-24 object-contain" />
                      </Link>

                      <div>
                        <Link to={`/products/${item.id}`} className="text-lg font-extrabold text-gray-900 hover:text-blue-700">
                          {item.name}
                        </Link>
                        <p className="mt-4 text-2xl font-extrabold text-blue-700">
                          {item.price.toLocaleString("vi-VN")}₫
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                        <button 
                          onClick={() => removeItem(item.id)} 
                          className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={20} />
                        </button>
                        <div className="flex items-center rounded-xl border border-gray-200">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-3 hover:text-blue-700">
                            <Minus size={16} />
                          </button>
                          <span className="px-4 font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-3 hover:text-blue-700">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-extrabold text-gray-900">Tóm tắt đơn hàng</h2>
                <div className="mt-6 space-y-4 border-b border-gray-100 pb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-bold text-gray-900">{subtotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-bold text-green-600">Miễn phí</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-3xl font-extrabold text-blue-700">{total.toLocaleString("vi-VN")}₫</span>
                </div>
                <Link to="/checkout" className="mt-8 block rounded-xl bg-blue-700 py-4 text-center font-bold text-white transition hover:bg-blue-800">
                  Thanh toán
                </Link>
              </aside>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default CartPage;