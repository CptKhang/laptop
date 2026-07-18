import { useState, useEffect } from "react";
import ProductCard from "../../components/home/ProductCard/ProductCard";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then((data) => {
        // Truy cập vào items vì API trả về { items: [...] }
        setProducts(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">Tất cả sản phẩm</h2>
        
        {loading ? (
          <div className="text-center py-10">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default ProductListPage;