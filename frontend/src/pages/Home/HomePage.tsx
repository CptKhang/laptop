import { useEffect, useState } from "react";
import Header from "../../components/layout/Header/Header";
import HeroBanner from "../../components/home/HeroBanner/HeroBanner";
import BrandList from "../../components/home/BrandList/BrandList";
// 1. IMPORT CHÍNH XÁC TYPE ĐÃ ĐƯỢC MỞ KHÓA TỪ COMPONENT CON
import ProductCard, { type ProductCardProps } from "../../components/home/ProductCard/ProductCard";
import Footer from "../../components/layout/Footer/Footer";
import { api } from "../../utils/api";

function HomePage() {
  // 2. ÉP KIỂU STATE KHỚP 100% VỚI YÊU CẦU CỦA PRODUCT CARD
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products", {
          params: { limit: 12 } 
        });
        
        const dataList = response.data?.items || [];
        setProducts(dataList);
      } catch (err: any) {
        console.error("Lỗi khi tải danh sách sản phẩm:", err);
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Header />
      <HeroBanner />
      <BrandList />

      <section className="mx-auto mt-16 max-w-7xl px-6 pb-20">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Danh sách sản phẩm</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <p className="text-gray-500 font-medium">Đang tải sản phẩm...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-600 font-medium border border-red-100">
            {error}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              /* 3. DẤU GẠCH ĐỎ SẼ BIẾN MẤT VÌ DỮ LIỆU ĐÃ ĐỒNG BỘ */
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
            Hiện chưa có sản phẩm nào được bày bán.
          </div>
        )}
      </section>
      
      <Footer />
    </>
  );
}

export default HomePage;