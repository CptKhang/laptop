import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";
// 1. Import API Client
import { api } from "../../utils/api";

type ProductDetail = {
  id: number | string;
  name: string;
  price: number | string;
  image: string;
  cpu?: string;
  ram?: string;
  storage?: string;
};

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 2. Sử dụng Axios để tải chi tiết sản phẩm
    api.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Lỗi khi tải chi tiết:", err);
        setError("Sản phẩm không tồn tại hoặc đã bị gỡ bỏ.");
        setLoading(false);
      });
  }, [id]);

  // 3. HÀM THÊM VÀO GIỎ HÀNG QUA API BACKEND (Đúng chuẩn api.md)
  const addToCart = async () => {
    if (!product) return;
    setSubmitting(true);

    try {
      // Endpoint: POST /cart/items[cite: 1]
      await api.post("/cart/items", {
        productId: Number(product.id),
        quantity: 1
      });

      alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (err: any) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
      if (err.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else {
        const msg = err.response?.data?.message || "Không thể thêm vào giỏ hàng lúc này.";
        alert(Array.isArray(msg) ? msg.join(", ") : msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-gray-500">Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="text-xl font-bold text-red-600 bg-red-50 p-6 rounded-2xl border border-red-100">{error}</div>
        <button onClick={() => navigate("/")} className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft size={18} /> Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Hình ảnh */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full max-h-[500px] object-contain rounded-2xl" 
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500?text=No+Image'; }}
            />
          </div>
          
          {/* Thông tin */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
            
            <p className="text-3xl font-bold text-blue-700 mt-6">
              {product.price ? `${Number(product.price).toLocaleString("vi-VN")}₫` : "Liên hệ"}
            </p>

            {/* Thông số kỹ thuật */}
            <div className="mt-8 space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Thông số kỹ thuật chi tiết</h3>
              <div className="grid grid-cols-1 gap-3 text-gray-700 pt-2">
                <p className="flex justify-between"><strong className="text-gray-500">Vi xử lý (CPU):</strong> <span>{product.cpu || "Đang cập nhật"}</span></p>
                <p className="flex justify-between"><strong className="text-gray-500">Bộ nhớ (RAM):</strong> <span>{product.ram || "Đang cập nhật"}</span></p>
                <p className="flex justify-between"><strong className="text-gray-500">Ổ cứng (Storage):</strong> <span>{product.storage || "Đang cập nhật"}</span></p>
              </div>
            </div>
            
            <div className="mt-8">
              <button 
                onClick={addToCart} 
                disabled={submitting}
                className="flex items-center justify-center gap-2 bg-blue-700 text-white w-full md:w-auto px-10 py-4 rounded-xl font-bold hover:bg-blue-800 transition text-lg shadow-lg shadow-blue-200 disabled:bg-blue-400"
              >
                <ShoppingCart size={22} />
                {submitting ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
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