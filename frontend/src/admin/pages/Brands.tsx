import { useState, useEffect } from "react";
import { Edit, Trash2, Tag, X } from "lucide-react";
import { api } from "../../utils/api";

type Brand = {
  id: number;
  name: string;
};

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho form Tạo mới / Cập nhật
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBrands = async () => {
    try {
      const res = await api.get("/brands");
      setBrands(res.data || []);
    } catch (err) {
      console.error("Lỗi tải thương hiệu:", err);
      setError("Không thể tải danh sách thương hiệu từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Xử lý Thêm mới hoặc Cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        // Cập nhật thương hiệu: PATCH /brands/:id
        await api.patch(`/brands/${editingId}`, { name: name.trim() });
        alert("Cập nhật tên thương hiệu thành công!");
      } else {
        // Tạo mới thương hiệu: POST /brands
        await api.post("/brands", { name: name.trim() });
        alert("Tạo thương hiệu mới thành công!");
      }

      setName("");
      setEditingId(null);
      fetchBrands();
    } catch (err: any) {
      console.error("Lỗi lưu thương hiệu:", err);
      const msg = err.response?.data?.message || "Không thể thực hiện thao tác.";
      alert(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Kích hoạt chế độ sửa
  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setName(brand.name);
  };

  // Hủy sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
  };

  // Xử lý Xóa thương hiệu: DELETE /brands/:id
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này? Thao tác có thể thất bại nếu đang có sản phẩm thuộc thương hiệu này.")) {
      return;
    }

    try {
      await api.delete(`/brands/${id}`);
      alert("Xóa thương hiệu thành công!");
      if (editingId === id) handleCancelEdit();
      fetchBrands();
    } catch (err: any) {
      console.error("Lỗi xóa thương hiệu:", err);
      const msg = err.response?.data?.message || "Không thể xóa thương hiệu này.";
      alert(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản lý Thương hiệu</h1>
          <p className="text-sm text-gray-500">Thêm, sửa, xóa các thương hiệu sản phẩm hệ thống.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Thêm / Sửa */}
        <div className={`p-6 rounded-3xl shadow-sm border transition-all h-fit ${editingId ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/20' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? `Đang sửa (ID: #${editingId})` : "Thêm thương hiệu mới"}
            </h2>
            {editingId && (
              <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên thương hiệu</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: ASUS, Dell, Apple..."
                className="w-full rounded-xl border bg-white p-3 focus:border-blue-500 focus:outline-none text-sm font-medium shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition disabled:bg-blue-300 text-sm shadow-sm"
              >
                {submitting ? "Đang xử lý..." : editingId ? "Lưu thay đổi" : "Thêm mới"}
              </button>
              {editingId && (
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition text-sm"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Bảng Danh sách Thương hiệu */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Tag size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Danh sách hiện tại ({brands.length})</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 font-medium">Đang tải dữ liệu thương hiệu...</div>
          ) : brands.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Chưa có thương hiệu nào được tạo.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-sm text-gray-600">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Tên thương hiệu</th>
                    <th className="p-4 font-semibold text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {brands.map((brand) => {
                    const isEditing = editingId === brand.id;
                    return (
                      <tr key={brand.id} className={`transition ${isEditing ? 'bg-blue-50/80 font-bold' : 'hover:bg-blue-50/30'}`}>
                        <td className="p-4 text-gray-500">#{brand.id}</td>
                        <td className="p-4 text-gray-900">
                          {brand.name}
                          {isEditing && <span className="ml-2 text-xs bg-blue-700 text-white px-2 py-0.5 rounded-full">Đang sửa</span>}
                        </td>
                        <td className="p-4 flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(brand)}
                            className={`p-2 rounded-lg transition ${isEditing ? 'bg-blue-700 text-white' : 'text-blue-600 hover:bg-blue-50'}`}
                            title="Sửa tên"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(brand.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}