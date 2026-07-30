import { useEffect, useState } from "react";
// 1. Import Tầng Nền tảng
import { api } from "../../utils/api"; 

type Product = {
  id: number;
  name: string;
  price: string | number; // Backend trả về string do dùng Decimal
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
};

type Category = {
  id: number;
  name: string;
};

type Brand = {
  id: number;
  name: string;
};

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
  const [categories, setCategories] = useState<Category[]>([]); // State lưu danh mục
  const [brands, setBrands] = useState<Brand[]>([]);             // State lưu thương hiệu
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const loadProducts = () => {
    api.get("/products")
      .then((res) => {
        if (res.data && Array.isArray(res.data.items)) {
          setProducts(res.data.items);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách sản phẩm:", err);
        setProducts([]);
      });
  };

  // Gọi API lấy danh mục
  const loadCategories = () => {
    api.get("/categories")
      .then((res) => {
        setCategories(res.data || []);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách danh mục:", err);
      });
  };

  // Gọi API lấy thương hiệu
  const loadBrands = () => {
    api.get("/brands")
      .then((res) => {
        setBrands(res.data || []);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách thương hiệu:", err);
      });
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
    if (!showForm) {
      resetForm();
    }
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
      console.error(err);
      const errorMessage = err.response?.data?.message || "Không có quyền thực hiện";
      alert(`Lỗi Backend:\n${Array.isArray(errorMessage) ? errorMessage.join("\n") : errorMessage}`);
    }
  };

  // 🛠 SỬA LỖI HÀM XÓA: Bóc tách lỗi chi tiết từ Server trả về
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Ngăn chặn sự kiện lan truyền lên thẻ tr nếu có
    
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await api.delete(`/products/${id}`);
        alert("Xóa sản phẩm thành công!");
        loadProducts();
      } catch (err: any) {
        console.error("Lỗi xóa sản phẩm:", err);
        const errorMessage = 
          err.response?.data?.message || 
          err.response?.data?.error || 
          "Không thể xóa sản phẩm này (có thể sản phẩm đã nằm trong đơn hàng hoặc không có quyền).";
        
        alert(`Thất bại:\n${Array.isArray(errorMessage) ? errorMessage.join("\n") : errorMessage}`);
      }
    }
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <button
          onClick={handleToggleForm}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl transition"
        >
          {showForm ? "Đóng Form" : "＋ Thêm sản phẩm mới"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border mb-8 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Tên sản phẩm</label>
            <input type="text" value={formData.name} required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Mô tả sản phẩm</label>
            <textarea required value={formData.description} className="w-full border p-2 rounded-lg" rows={3} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          {/* Trường chọn Danh mục sản phẩm */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Danh mục sản phẩm</label>
            <select 
              value={formData.categoryId} 
              onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              className="w-full border p-2 rounded-lg bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Trường chọn Thương hiệu sản phẩm */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Thương hiệu (Brand)</label>
            <select 
              value={formData.brandId} 
              onChange={(e) => setFormData({ ...formData, brandId: Number(e.target.value) })}
              className="w-full border p-2 rounded-lg bg-white"
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Giá bán (đ)</label>
            <input type="number" value={formData.price} required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Số lượng tồn kho</label>
            <input type="number" value={formData.stock} required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Đường dẫn ảnh URL</label>
            <input type="text" value={formData.image} required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Vi xử lý (CPU)</label>
            <input type="text" value={formData.cpu} required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, cpu: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Bộ nhớ (RAM)</label>
            <input type="text" value={formData.ram} required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, ram: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Ổ cứng (Storage)</label>
            <input type="text" value={formData.storage} required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, storage: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-xl font-bold text-gray-600">Hủy</button>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold shadow-md">
              {editingId ? "Cập nhật sản phẩm" : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600">Hình ảnh</th>
              <th className="p-4 font-semibold text-gray-600">Tên sản phẩm</th>
              <th className="p-4 font-semibold text-gray-600">Giá thành</th>
              <th className="p-4 font-semibold text-gray-600">Tồn kho</th>
              <th className="p-4 font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">
                  <img 
                    src={p.image} 
                    className="w-12 h-12 object-contain" 
                    alt={p.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image'; }}
                  />
                </td>
                <td className="p-4 font-semibold text-gray-800">{p.name}</td>
                <td className="p-4 text-blue-700 font-bold">{Number(p.price).toLocaleString("vi-VN")}₫</td>
                <td className="p-4 text-gray-600">{p.stock} máy</td>
                <td className="p-4 space-x-4">
                  <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 font-bold hover:underline">Sửa</button>
                  {/* Cập nhật sự kiện gọi hàm xóa kèm event.stopPropagation */}
                  <button onClick={(e) => handleDelete(e, p.id)} className="text-red-500 hover:text-red-700 font-bold hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;