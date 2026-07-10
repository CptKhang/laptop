import Header from "../../components/layout/Header/Header";
import HeroBanner from "../../components/home/HeroBanner/HeroBanner";
import BrandList from "../../components/home/BrandList/BrandList";
import ProductCard from "../../components/home/ProductCard/ProductCard";
import Footer from "../../components/layout/Footer/Footer";

const products = [
  {
    name: "MacBook Air M2 2022 13.6 inch 8GB/256GB",
    price: 26490000,
    oldPrice: 29990000,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/282827/apple-macbook-air-m2-2022-xanh-600x600.jpg",
    cpu: "Apple M2",
    ram: "8GB RAM",
    storage: "256GB SSD",
    discount: "-12%",
  },
  {
    name: "Asus TUF Gaming F15 FX506HF i5 11400H",
    price: 16990000,
    oldPrice: 19990000,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/269468/asus-tuf-gaming-fx506hf-i5-hn014w-600x600.jpg",
    cpu: "Intel Core i5",
    ram: "8GB RAM",
    storage: "512GB SSD",
    discount: "Trả góp 0%",
  },
  {
    name: "Lenovo LOQ Gaming Ryzen 7 7840HS",
    price: 22990000,
    oldPrice: 24990000,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/317507/lenovo-loq-15aph8-r7-82xt001tvn-600x600.jpg",
    cpu: "AMD Ryzen 7",
    ram: "16GB RAM",
    storage: "512GB SSD",
    discount: "-8%",
  },
  {
    name: "HP Victus 15 FA1093TX i5 13420H",
    price: 18990000,
    oldPrice: 20990000,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/322267/hp-victus-15-fa1093tx-i5-8c5m2pa-600x600.jpg",
    cpu: "Intel Core i5",
    ram: "16GB RAM",
    storage: "512GB SSD",
    discount: "-10%",
  },
];

function HomePage() {
  return (
    <>
      <Header />
      <HeroBanner />
      <BrandList />

      <section className="mx-auto mt-16 max-w-7xl px-6 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-bold text-blue-700">Sản phẩm nổi bật</p>

            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Laptop Bán Chạy
            </h2>

            <p className="mt-2 text-gray-500">
              Những mẫu laptop được khách hàng lựa chọn nhiều nhất.
            </p>
          </div>

          <button className="rounded-full border border-blue-200 px-5 py-2 font-semibold text-blue-700 transition hover:bg-blue-700 hover:text-white">
            Xem tất cả →
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default HomePage;