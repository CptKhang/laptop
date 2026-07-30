import { useState, useEffect } from "react";
import { UserRound, Package, Phone, Mail, MapPin, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
// Import Tầng Nền tảng (Axios đã được cấu hình tự động gắn Token)
import { api } from "../../utils/api";

type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
};

// Ánh xạ chính xác các trạng thái từ tài liệu Backend
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

type OrderHistory = {
  id: number;
  total: string | number;
  status: OrderStatus;
  createdAt: string;
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPING: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"INFO" | "ORDERS">("INFO");
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 1. Gọi API lấy thông tin người dùng (/users/me)
        const userRes = await api.get("/users/me");
        setProfile(userRes.data);

        // 2. Gọi API lấy danh sách đơn hàng (/orders)
        const ordersRes = await api.get("/orders");
        // Bắt buộc phải trích xuất mảng từ thuộc tính .items do backend phân trang
        const orderData = ordersRes.data?.items || [];
        setOrders(orderData);
      } catch (err: any) {
        console.error("Lỗi tải thông tin:", err);
        if (err.response?.status === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("access_token");
          navigate("/login");
        } else {
          setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setUpdating(true);

    try {
      // 3. Tuân thủ Whitelist của Backend: Chỉ gửi fullName, phone, address
      await api.patch("/users/me", {
        fullName: profile.fullName,
        phone: profile.phone || "",
        address: profile.address || "",
      });
      alert("Cập nhật thông tin thành công!");
    } catch (err: any) {
      console.error(err);
      // Đọc mảng lỗi Validation từ Backend (nếu có)
      const errorMessage = err.response?.data?.message || "Lỗi hệ thống khi cập nhật thông tin.";
      alert(`Thất bại: ${Array.isArray(errorMessage) ? errorMessage.join("\n") : errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("access_token");
      navigate("/login");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-medium text-gray-500">Đang tải dữ liệu hồ sơ...</div>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f4f7ff] py-10">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Tài khoản của tôi</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Điều hướng */}
            <aside className="bg-white rounded-3xl p-6 shadow-sm h-fit border border-gray-100">
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setActiveTab("INFO")}
                  className={`flex items-center gap-3 p-4 rounded-xl font-bold transition ${activeTab === "INFO" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <UserRound size={20} /> Hồ sơ cá nhân
                </button>
                <button 
                  onClick={() => setActiveTab("ORDERS")}
                  className={`flex items-center gap-3 p-4 rounded-xl font-bold transition ${activeTab === "ORDERS" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <Package size={20} /> Lịch sử đơn hàng
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-4 rounded-xl font-bold text-red-600 hover:bg-red-50 transition mt-4"
                >
                  <LogOut size={20} /> Đăng xuất
                </button>
              </div>
            </aside>

            {/* Nội dung chính */}
            <section className="lg:col-span-3">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-semibold">
                  {error}
                </div>
              )}

              {activeTab === "INFO" && profile && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 border-b pb-4 text-gray-900">Thông tin cá nhân</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-2xl">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Địa chỉ Email (Không thể thay đổi)</label>
                      <div className="flex items-center rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 cursor-not-allowed">
                        <Mail size={18} className="text-gray-400" />
                        <input type="email" disabled value={profile.email} className="ml-3 w-full bg-transparent outline-none text-gray-500 font-medium" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Họ và tên</label>
                      <div className="flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 shadow-sm">
                        <UserRound size={18} className="text-gray-400" />
                        <input type="text" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Số điện thoại</label>
                      <div className="flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 shadow-sm">
                        <Phone size={18} className="text-gray-400" />
                        <input type="tel" value={profile.phone || ""} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium" placeholder="Cập nhật số điện thoại" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Địa chỉ nhận hàng mặc định</label>
                      <div className="flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 shadow-sm">
                        <MapPin size={18} className="text-gray-400" />
                        <input type="text" value={profile.address || ""} onChange={(e) => setProfile({...profile, address: e.target.value})} className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium" placeholder="Nhập địa chỉ nhận hàng của bạn" />
                      </div>
                    </div>
                    <button type="submit" disabled={updating} className="mt-6 w-full md:w-auto rounded-xl bg-blue-700 px-10 py-3.5 font-bold text-white transition hover:bg-blue-800 disabled:bg-gray-400 shadow-md">
                      {updating ? "Đang lưu hệ thống..." : "Lưu thay đổi"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "ORDERS" && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 border-b pb-4 text-gray-900">Lịch sử đơn hàng</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                      <Package size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Bạn chưa thực hiện đơn hàng nào trên hệ thống.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-semibold text-gray-600">Mã đơn</th>
                            <th className="p-4 font-semibold text-gray-600">Ngày đặt</th>
                            <th className="p-4 font-semibold text-gray-600">Tổng thanh toán</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} className="border-b hover:bg-blue-50/50 transition cursor-pointer" onClick={() => navigate(`/profile/orders/${order.id}`)}>
                              <td className="p-4 font-bold text-blue-600 hover:underline">#{order.id}</td>
                              <td className="p-4 text-gray-600 font-medium">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                              {/* Ép kiểu Number để hiển thị Decimal an toàn */}
                              <td className="p-4 font-bold text-gray-900">{Number(order.total).toLocaleString("vi-VN")}₫</td>
                              <td className="p-4 text-center">
                                <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                                  {STATUS_LABELS[order.status]}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ProfilePage;