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
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
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
  });

  const loadProducts = () => {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then((data: any) => {
        // SỬA Ở ĐÂY: Truy cập vào data.items thay vì data trực tiếp
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    
    if (!token || token === "undefined" || token === "null") {
      alert("Lỗi: Không tìm thấy mã phiên đăng nhập. Vui lòng đăng nhập lại!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Thêm sản phẩm mới vào hệ thống thành công!");
        setShowForm(false);
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
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl transition"
        >
          {showForm ? "Đóng Form" : "＋ Thêm sản phẩm mới"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border mb-8 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Tên sản phẩm</label>
            <input type="text" required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Mô tả sản phẩm</label>
            <textarea required className="w-full border p-2 rounded-lg" rows={3} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Giá bán (đ)</label>
            <input type="number" required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Số lượng tồn kho</label>
            <input type="number" required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Đường dẫn ảnh URL</label>
            <input type="text" required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Vi xử lý (CPU)</label>
            <input type="text" required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, cpu: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Bộ nhớ (RAM)</label>
            <input type="text" required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, ram: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Ổ cứng (Storage)</label>
            <input type="text" required className="w-full border p-2 rounded-lg" onChange={(e) => setFormData({ ...formData, storage: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-xl font-bold text-gray-600">Hủy</button>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold shadow-md">Lưu sản phẩm</button>
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
                <td className="p-4"><img src={p.image} className="w-12 h-12 object-contain" alt="" /></td>
                <td className="p-4 font-semibold text-gray-800">{p.name}</td>
                <td className="p-4 text-blue-700 font-bold">{p.price.toLocaleString("vi-VN")}₫</td>
                <td className="p-4 text-gray-600">{p.stock} máy</td>
                <td className="p-4">
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