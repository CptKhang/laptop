import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard, { type ProductCardProps } from "../../components/home/ProductCard/ProductCard";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";
import { api } from "../../utils/api";

function ProductListPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const brandId = searchParams.get("brandId") || "";

  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. THÊM STATE QUẢN LÝ LUỒNG DỮ LIỆU
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // 2. RESET TRANG VỀ 1 KHI BỘ LỌC THAY ĐỔI
  useEffect(() => {
    setPage(1);
    setProducts([]); // Xóa dữ liệu cũ khi người dùng đổi danh mục/tìm kiếm
  }, [searchQuery, categoryId, brandId]);

  // 3. GỌI API KÈM PHÂN TRANG
  useEffect(() => {
    setLoading(true);
    
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (categoryId) params.append("categoryId", categoryId);
    if (brandId) params.append("brandId", brandId);
    
    // Ép buộc Backend phải phân trang
    params.append("page", page.toString());
    params.append("limit", "12"); 

    const endpoint = `/products?${params.toString()}`;

    api.get(endpoint)
      .then((res) => {
        const dataList = res.data?.items || [];
        
        // CỐT LÕI: Nếu là trang 1 thì ghi đè, từ trang 2 trở đi thì nối mảng (Load More)
        setProducts((prev) => page === 1 ? dataList : [...prev, ...dataList]);
        
        setTotalPages(res.data?.totalPages || 1);
        setTotalItems(res.data?.total || 0); // Lấy con số 53 thực tế
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Lỗi khi tải danh sách sản phẩm:", err);
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
        setLoading(false);
      });
  }, [searchQuery, categoryId, brandId, page]);

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
        
        {/* Hiển thị con số thực tế thay vì độ dài mảng bị cắt xén */}
        <p className="text-gray-500 mb-8">Tìm thấy {totalItems} sản phẩm phù hợp.</p>
        
        {loading && page === 1 ? (
          <div className="text-center py-20 text-gray-500 font-medium text-lg">Đang tải dữ liệu sản phẩm...</div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-600 font-bold border border-red-100">
            {error}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* 4. NÚT LOAD MORE (Chỉ hiện khi chưa đến trang cuối) */}
            {page < totalPages && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loading}
                  className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  {loading ? "Đang tải thêm..." : `Xem thêm sản phẩm (Còn ${totalItems - products.length})`}
                </button>
              </div>
            )}
          </>
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