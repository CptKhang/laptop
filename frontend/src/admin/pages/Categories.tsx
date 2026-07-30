import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { api } from "../../utils/api";

type Category = {
  id: number;
  name: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho form Tạo mới / Cập nhật
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
      setError("Không thể tải danh sách danh mục từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Xử lý Thêm mới hoặc Cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        // Cập nhật danh mục: PATCH /categories/:id[cite: 1]
        await api.patch(`/categories/${editingId}`, { name: name.trim() });
        alert("Cập nhật danh mục thành công!");
      } else {
        // Tạo mới danh mục: POST /categories[cite: 1]
        await api.post("/categories", { name: name.trim() });
        alert("Tạo danh mục mới thành công!");
      }

      setName("");
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      console.error("Lỗi lưu danh mục:", err);
      const msg = err.response?.data?.message || "Không thể thực hiện thao tác.";
      alert(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Kích hoạt chế độ sửa
  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
  };

  // Xử lý Xóa danh mục: DELETE /categories/:id[cite: 1]
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này? Thao tác có thể thất bại nếu danh mục đang được sử dụng bởi sản phẩm.")) {
      return;
    }

    try {
      await api.delete(`/categories/${id}`);
      alert("Xóa danh mục thành công!");
      fetchCategories();
    } catch (err: any) {
      console.error("Lỗi xóa danh mục:", err);
      const msg = err.response?.data?.message || "Không thể xóa danh mục này (có thể đang có sản phẩm thuộc danh mục).";
      alert(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản lý Danh mục</h1>
          <p className="text-sm text-gray-500">Thêm, sửa, xóa các danh mục sản phẩm hệ thống.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Thêm / Sửa */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? "Cập nhật danh mục" : "Thêm danh mục mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên danh mục</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Laptop Gaming"
                className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none text-sm"
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
                  onClick={() => { setEditingId(null); setName(""); }}
                  className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition text-sm"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Bảng Danh sách Danh mục */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <FolderTree size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Danh sách hiện tại ({categories.length})</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 font-medium">Đang tải dữ liệu danh mục...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Chưa có danh mục nào được tạo.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-sm text-gray-600">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Tên danh mục</th>
                    <th className="p-4 font-semibold text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-blue-50/30 transition">
                      <td className="p-4 font-bold text-gray-500">#{cat.id}</td>
                      <td className="p-4 font-extrabold text-gray-900">{cat.name}</td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}