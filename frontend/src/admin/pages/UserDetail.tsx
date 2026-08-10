import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Shield, Calendar, User as UserIcon, Trash2, Phone, MapPin } from "lucide-react";
import { api } from "../../utils/api";

type UserDetailType = {
  id: number | string;
  fullName: string;
  email: string;
  phone?: string;     // Số điện thoại
  address?: string;   // Địa chỉ
  role: string;
  createdAt?: string; // Ngày tạo
};

function UserDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = (location.state as { user?: UserDetailType })?.user;

  const handleDeleteUser = async () => {
    if (!user) return;
    
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa tài khoản của "${user.fullName}" không? Thao tác này không thể hoàn tác.`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/users/${user.id}`);
      alert("Xóa người dùng thành công!");
      
      // Điều hướng về trang quản lý người dùng
      navigate("/admin/users", { replace: true });
      
    } catch (err: any) {
      console.error("Lỗi khi xóa người dùng:", err);
      const errorMessage = err.response?.data?.message || "Không thể xóa người dùng này.";
      alert(`Lỗi: ${Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage}`);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 font-semibold flex items-center gap-2">
          <ArrowLeft size={16} /> Quay lại
        </button>
        <div className="text-red-600 font-bold bg-red-50 p-4 rounded-xl border border-red-200">
          Không tìm thấy thông tin người dùng. Vui lòng quay lại danh sách và chọn lại.
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-blue-600 font-semibold hover:underline"
        >
          <ArrowLeft size={18} /> Quay lại danh sách người dùng
        </button>

        <button 
          onClick={handleDeleteUser}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition text-sm shadow-sm border border-red-200"
        >
          <Trash2 size={16} /> Xóa tài khoản này
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Chi tiết tài khoản #{user.id}</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6 max-w-3xl">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">{user.fullName}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Mail size={14} /> {user.email}
            </p>
          </div>
        </div>

        {/* Lưới thông tin chi tiết mở rộng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Vai trò hệ thống</p>
            <p className="flex items-center gap-2 font-bold text-gray-800">
              <Shield size={16} className="text-blue-600" />
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${user.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                {user.role}
              </span>
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Số điện thoại</p>
            <p className="flex items-center gap-2 font-medium text-gray-800 text-sm">
              <Phone size={16} className="text-blue-600" />
              {user.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 md:col-span-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Địa chỉ giao hàng</p>
            <p className="flex items-center gap-2 font-medium text-gray-800 text-sm">
              <MapPin size={16} className="text-blue-600" />
              {user.address || <span className="text-gray-400 italic">Chưa cập nhật địa chỉ</span>}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Ngày tạo tài khoản</p>
            <p className="flex items-center gap-2 font-medium text-gray-800 text-sm">
              <Calendar size={16} className="text-blue-600" />
              {user.createdAt ? new Date(user.createdAt).toLocaleString("vi-VN") : "Không có dữ liệu"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetail;