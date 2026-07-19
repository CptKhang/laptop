import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  cpu: string;
  ram: string;
  storage: string;
  description: string;
  // Bổ sung các trường có thể có để tránh lỗi TypeScript khi map dữ liệu
  screen?: string;
  gpu?: string;
  warranty?: string;
  categoryId?: number;
  brandId?: number;
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
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const loadProducts = () => {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then((data: any) => {
        if (data && Array.isArray(data.items)) {
          setProducts(data.items);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error("Lỗi fetch products:", err);
        setProducts([]);
      });
  };

  useEffect(() => {
    loadProducts();
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
      price: product.price,
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
    
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      alert("Lỗi: Không tìm thấy mã phiên đăng nhập. Vui lòng đăng nhập lại!");
      return;
    }

    try {
      // Phân luồng logic: Nếu có editingId -> Sửa (PUT), Nếu không -> Thêm mới (POST)
      const url = editingId 
        ? `http://localhost:3000/products/${editingId}` 
        : "http://localhost:3000/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(editingId ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm mới thành công!");
        setShowForm(false);
        resetForm();
        loadProducts();
      } else {
        const data = await res.json();
        const errorMsg = Array.isArray(data.message) ? data.message.join("\n") : data.message;
        alert(`Lỗi Backend (${res.status}):\n${errorMsg || "Không có quyền thực hiện"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Mất kết nối tới server backend.");
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      fetch(`http://localhost:3000/products/${id}`, { method: "DELETE" })
        .then(() => loadProducts())
        .catch((err) => console.error(err));
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
                  {/* Đã thêm cơ chế chống lỗi UI bằng onError */}
                  <img 
                    src={p.image} 
                    className="w-12 h-12 object-contain" 
                    alt={p.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image'; }}
                  />
                </td>
                <td className="p-4 font-semibold text-gray-800">{p.name}</td>
                <td className="p-4 text-blue-700 font-bold">{p.price.toLocaleString("vi-VN")}₫</td>
                <td className="p-4 text-gray-600">{p.stock} máy</td>
                <td className="p-4 space-x-4">
                  <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 font-bold hover:underline">Sửa</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 font-bold hover:underline">Xóa</button>
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