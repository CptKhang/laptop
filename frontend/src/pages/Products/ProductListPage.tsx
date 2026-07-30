import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
// 1. Import chính xác type để chống lỗi gạch đỏ (verbatimModuleSyntax)
import ProductCard, { type ProductCardProps } from "../../components/home/ProductCard/ProductCard";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";
// 2. Import Tầng Nền tảng
import { api } from "../../utils/api";

function ProductListPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const brandId = searchParams.get("brandId") || "";

  // 3. Ép kiểu State khớp 100% với Component con
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    // 4. Xây dựng query string linh hoạt dựa theo api.md
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (categoryId) params.append("categoryId", categoryId);
    if (brandId) params.append("brandId", brandId);

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";

    // 5. Gọi mạng qua Axios Client
    api.get(endpoint)
      .then((res) => {
        // Trích xuất mảng items từ dữ liệu phân trang chuẩn của Backend[cite: 1]
        const dataList = res.data?.items || [];
        setProducts(dataList);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Lỗi khi tải danh sách sản phẩm:", err);
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
        setLoading(false);
      });
  }, [searchQuery, categoryId, brandId]); // Tự động gọi lại khi URL thay đổi

  // Tiêu đề động dựa vào điều kiện lọc
  const getTitle = () => {
    if (searchQuery) return `Kết quả tìm kiếm cho: "${searchQuery}"`;
    if (categoryId) return `Sản phẩm theo danh mục`;
    if (brandId) return `Sản phẩm thương hiệu đặc biệt`;
    return "Tất cả sản phẩm";
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-10 min-h-screen">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">{getTitle()}</h2>
        <p className="text-gray-500 mb-8">Tìm thấy {products.length} sản phẩm phù hợp.</p>
        
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium text-lg">Đang tải dữ liệu sản phẩm...</div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-600 font-bold border border-red-100">
            {error}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 font-medium">
            Hiện không tìm thấy sản phẩm nào phù hợp với bộ lọc này.
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default ProductListPage;