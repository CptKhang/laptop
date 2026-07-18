import { useState, useEffect } from "react";
import Header from "../../components/layout/Header/Header";
import HeroBanner from "../../components/home/HeroBanner/HeroBanner";
import BrandList from "../../components/home/BrandList/BrandList";
import ProductCard from "../../components/home/ProductCard/ProductCard";
import Footer from "../../components/layout/Footer/Footer";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/products");
        const data = await response.json();
        
        // Truy cập vào items vì API trả về { items: [...] }
        setProducts(data.items || []); 
      } catch (error) {
        console.error("Lỗi khi fetch API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Header />
      <HeroBanner />
      <BrandList />

      <section className="mx-auto mt-16 max-w-7xl px-6 pb-20">
        <h2 className="mb-8 text-2xl font-bold">Danh sách sản phẩm</h2>

        {loading ? (
          <div className="text-center py-10">Đang tải sản phẩm...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">Không tìm thấy sản phẩm nào.</div>
        )}
      </section>
      
      <Footer />
    </>
  );
}

export default HomePage;