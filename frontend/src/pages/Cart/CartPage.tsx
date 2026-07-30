import { useState, useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";
// 1. Import Tầng Nền tảng (Axios Client tự động gắn Token)
import { api } from "../../utils/api";

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Gọi API lấy giỏ hàng từ Server khi load trang
  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      // Trích xuất mảng items từ cấu trúc giỏ hàng của Backend
      setCartItems(response.data?.items || []);
    } catch (err: any) {
      console.error("Lỗi khi tải giỏ hàng:", err);
      if (err.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else {
        setError("Không thể đồng bộ giỏ hàng từ máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [navigate]);

  // 3. Hàm gọi API cập nhật số lượng (Dùng CartItem ID)
  const updateQuantity = async (cartItemId: number | string, currentQty: number, change: number) => {
    const newQuantity = currentQty + change;
    if (newQuantity < 1) return;

    try {
      // Endpoint: PATCH /cart/items/:id với id là cartItemId
      await api.patch(`/cart/items/${cartItemId}`, { quantity: newQuantity });
      // Tải lại giỏ hàng để cập nhật trạng thái mới nhất từ server
      fetchCart();
    } catch (err: any) {
      console.error("Lỗi cập nhật số lượng:", err);
      const msg = err.response?.data?.message || "Không thể thay đổi số lượng.";
      alert(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  // 4. Hàm gọi API xóa sản phẩm khỏi giỏ (Dùng CartItem ID)
  const removeItem = async (cartItemId: number | string) => {
    try {
      // Endpoint: DELETE /cart/items/:id với id là cartItemId
      await api.delete(`/cart/items/${cartItemId}`);
      fetchCart();
    } catch (err: any) {
      console.error("Lỗi xóa sản phẩm:", err);
      alert("Không thể xóa sản phẩm khỏi giỏ hàng.");
    }
  };

  // Tính toán tổng tiền dựa trên cấu trúc dữ liệu nested (item.product.price)
  const subtotal = cartItems.reduce(
    (total, item) => total + (Number(item.product?.price) || 0) * (item.quantity || 0),
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-semibold">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">Đang đồng bộ giỏ hàng từ máy chủ...</div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
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
                    <p className="text-sm text-gray-500">Có {cartItems.length} dòng sản phẩm.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {cartItems.map((item) => {
                    const product = item.product || {};
                    return (
                      <div key={item.id} className="grid gap-5 rounded-2xl border border-gray-100 p-4 sm:grid-cols-[140px_1fr_auto] items-center">
                        <Link to={`/products/${product.id}`} className="flex h-32 items-center justify-center rounded-2xl bg-blue-50">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="max-h-24 object-contain" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'; }}
                          />
                        </Link>

                        <div>
                          <Link to={`/products/${product.id}`} className="text-lg font-extrabold text-gray-900 hover:text-blue-700 line-clamp-2">
                            {product.name}
                          </Link>
                          {/* Ép kiểu Number để hiển thị Decimal an toàn */}
                          <p className="mt-2 text-2xl font-extrabold text-blue-700">
                            {Number(product.price || 0).toLocaleString("vi-VN")}₫
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                          <button 
                            onClick={() => removeItem(item.id)} 
                            className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 size={20} />
                          </button>
                          <div className="flex items-center rounded-xl border border-gray-200">
                            <button onClick={() => updateQuantity(item.id, item.quantity, -1)} className="p-3 hover:text-blue-700 transition">
                              <Minus size={16} />
                            </button>
                            <span className="px-4 font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity, 1)} className="p-3 hover:text-blue-700 transition">
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                <Link to="/checkout" className="mt-8 block rounded-xl bg-blue-700 py-4 text-center font-bold text-white transition hover:bg-blue-800 shadow-md">
                  Tiến hành Thanh toán
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