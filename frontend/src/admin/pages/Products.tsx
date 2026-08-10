import { useEffect, useState } from "react";
import { api } from "../../utils/api"; 

type Product = {
  id: number;
  name: string;
  price: string | number;
  stock: number;
  image: string;
  cpu: string;
  ram: string;
  storage: string;
  description: string;
  screen?: string;
  gpu?: string;
  warranty?: string;
  categoryId?: number;
  brandId?: number;
  isActive?: boolean;
};

type Category = { id: number; name: string; };
type Brand = { id: number; name: string; };

const DEFAULT_FORM_DATA = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  image: "",
  cpu: "",
  ram: "",
  storage: "",
  screen: "15.6 inch",
  gpu: "Card tích hợp",
  warranty: "12 tháng",
  categoryId: 1,
  brandId: 1,
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const loadProducts = () => {
    api.get("/products")
      .then((res) => {
        setProducts(res.data && Array.isArray(res.data.items) ? res.data.items : []);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách sản phẩm:", err);
        setProducts([]);
      });
  };

  const loadCategories = () => {
    api.get("/categories").then((res) => setCategories(res.data || [])).catch(() => {});
  };

  const loadBrands = () => {
    api.get("/brands").then((res) => setBrands(res.data || [])).catch(() => {});
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
  }, []);

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setEditingId(null);
  };

  const handleToggleForm = () => {
    if (!showForm) resetForm();
    setShowForm(!showForm);
  };

  const handleEditClick = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      image: product.image,
      cpu: product.cpu,
      ram: product.ram,
      storage: product.storage,
      screen: product.screen || "15.6 inch",
      gpu: product.gpu || "Card tích hợp",
      warranty: product.warranty || "12 tháng",
      categoryId: product.categoryId || 1,
      brandId: product.brandId || 1,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/products/${editingId}`, formData);
      } else {
        await api.post("/products", formData);
      }
      alert(editingId ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm mới thành công!");
      setShowForm(false);
      resetForm();
      loadProducts();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Không có quyền thực hiện";
      alert(`Lỗi Backend:\n${Array.isArray(errorMessage) ? errorMessage.join("\n") : errorMessage}`);
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, id: number, currentStatus: boolean = true) => {
    e.stopPropagation();
    const actionText = currentStatus ? "ngừng kinh doanh" : "đưa vào kinh doanh";
    
    if (window.confirm(`Bạn có chắc chắn muốn chuyển sản phẩm này sang trạng thái ${actionText}?`)) {
      try {
        await api.patch(`/products/${id}/status`, { isActive: !currentStatus });
        alert("Cập nhật trạng thái sản phẩm thành công!");
        loadProducts();
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Không thể thay đổi trạng thái sản phẩm.";
        alert(`Thất bại:\n${Array.isArray(errorMessage) ? errorMessage.join("\n") : errorMessage}`);
      }
    }
  };

  // 🛠 HÀM XỬ LÝ XÓA SẢN PHẨM
  const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${name}"?`)) {
      try {
        await api.delete(`/products/${id}`);
        alert("Xóa sản phẩm thành công!");
        loadProducts();
      } catch (err: any) {
        console.error("Lỗi xóa sản phẩm:", err);
        const errorMessage = err.response?.data?.message || "Không thể xóa sản phẩm này vì đã có trong đơn hàng.";
        alert(`Thất bại:\n${Array.isArray(errorMessage) ? errorMessage.join("\n") : errorMessage}`);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách sản phẩm, trạng thái kinh doanh và xóa sản phẩm</p>
        </div>
        <button
          onClick={handleToggleForm}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition"
        >
          {showForm ? "Đóng Form" : "＋ Thêm sản phẩm mới"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border mb-8 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Tên sản phẩm</label>
            <input type="text" value={formData.name} required className="w-full border p-2.5 rounded-xl focus:outline-blue-500" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Mô tả sản phẩm</label>
            <textarea required value={formData.description} className="w-full border p-2.5 rounded-xl focus:outline-blue-500" rows={3} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Danh mục sản phẩm</label>
            <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })} className="w-full border p-2.5 rounded-xl bg-white focus:outline-blue-500">
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Thương hiệu (Brand)</label>
            <select value={formData.brandId} onChange={(e) => setFormData({ ...formData, brandId: Number(e.target.value) })} className="w-full border p-2.5 rounded-xl bg-white focus:outline-blue-500">
              {brands.map((brand) => (<option key={brand.id} value={brand.id}>{brand.name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Giá bán (đ)</label>
            <input type="number" value={formData.price} required className="w-full border p-2.5 rounded-xl focus:outline-blue-500" onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Số lượng tồn kho</label>
            <input type="number" value={formData.stock} required className="w-full border p-2.5 rounded-xl focus:outline-blue-500" onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Đường dẫn ảnh URL</label>
            <input type="text" value={formData.image} required className="w-full border p-2.5 rounded-xl focus:outline-blue-500" onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Vi xử lý (CPU)</label>
            <input type="text" value={formData.cpu} required className="w-full border p-2.5 rounded-xl focus:outline-blue-500" onChange={(e) => setFormData({ ...formData, cpu: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Bộ nhớ (RAM)</label>
            <input type="text" value={formData.ram} required className="w-full border p-2.5 rounded-xl focus:outline-blue-500" onChange={(e) => setFormData({ ...formData, ram: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Ổ cứng (Storage)</label>
            <input type="text" value={formData.storage} required className="w-full border p-2.5 rounded-xl focus:outline-blue-500" onChange={(e) => setFormData({ ...formData, storage: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl font-bold text-gray-600 transition">Hủy</button>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition">
              {editingId ? "Cập nhật sản phẩm" : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/75 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4 w-20 text-center">Hình ảnh</th>
              <th className="p-4">Tên sản phẩm</th>
              <th className="p-4 w-36">Giá thành</th>
              <th className="p-4 w-28">Tồn kho</th>
              <th className="p-4 w-36">Trạng thái</th>
              <th className="p-4 w-52 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {products.map((p) => {
              const isActive = p.isActive ?? true;
              return (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 text-center">
                    <div className="w-12 h-12 bg-gray-50 border rounded-xl p-1 mx-auto flex items-center justify-center">
                      <img 
                        src={p.image} 
                        className="max-w-full max-h-full object-contain" 
                        alt={p.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Img'; }}
                      />
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-900 max-w-xs truncate" title={p.name}>
                    {p.name}
                  </td>
                  <td className="p-4 text-blue-600 font-bold whitespace-nowrap">
                    {Number(p.price).toLocaleString("vi-VN")}₫
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap font-medium">
                    {p.stock} máy
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {isActive ? "Đang kinh doanh" : "Ngừng kinh doanh"}
                    </span>
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleEditClick(p)} 
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={(e) => handleToggleStatus(e, p.id, isActive)} 
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition text-white ${
                          isActive 
                            ? "bg-amber-600 hover:bg-amber-700" 
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {isActive ? "Ngừng bán" : "Bán lại"}
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, p.id, p.name)} 
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;