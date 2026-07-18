import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("Lỗi khi tải chi tiết:", err));
  }, [id]);

  // HÀM THÊM VÀO GIỎ HÀNG
  const addToCart = () => {
    // 1. Lấy dữ liệu giỏ hàng cũ ra
    const savedCart = localStorage.getItem("techblue_cart");
    const cart = savedCart ? JSON.parse(savedCart) : [];

    // 2. Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex !== -1) {
      // Nếu có rồi thì tăng số lượng
      cart[existingIndex].quantity += 1;
    } else {
      // Nếu chưa có thì thêm mới vào giỏ
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        cpu: product.cpu,
        ram: product.ram,
        storage: product.storage
      });
    }

    // 3. Lưu lại vào localStorage với key "techblue_cart"
    localStorage.setItem("techblue_cart", JSON.stringify(cart));
    alert("Đã thêm sản phẩm vào giỏ hàng!");
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center">Đang tải sản phẩm...</div>;

  return (
    <>
      <Header />
      
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Hình ảnh */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <img src={product.image} alt={product.name} className="w-full h-auto object-contain rounded-2xl" />
          </div>
          
          {/* Thông tin */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
            
            <p className="text-3xl font-bold text-blue-700 mt-6">
              {product.price ? product.price.toLocaleString("vi-VN") + "₫" : "Liên hệ"}
            </p>

            {/* Thông số kỹ thuật */}
            <div className="mt-8 space-y-4 bg-gray-50 p-6 rounded-2xl">
              <h3 className="font-bold text-lg text-gray-900">Thông số kỹ thuật</h3>
              <div className="grid grid-cols-1 gap-2 text-gray-700">
                <p><strong>CPU:</strong> {product.cpu || "Đang cập nhật"}</p>
                <p><strong>RAM:</strong> {product.ram || "Đang cập nhật"}</p>
                <p><strong>Ổ cứng:</strong> {product.storage || "Đang cập nhật"}</p>
              </div>
            </div>
            
            <div className="mt-8">
              <button 
                onClick={addToCart} 
                className="flex items-center justify-center gap-2 bg-blue-700 text-white w-full md:w-auto px-10 py-4 rounded-xl font-bold hover:bg-blue-800 transition text-lg shadow-lg shadow-blue-200"
              >
                <ShoppingCart size={22} />
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetailPage;