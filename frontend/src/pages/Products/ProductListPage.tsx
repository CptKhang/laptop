import ProductCard from "../../components/home/ProductCard/ProductCard";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";

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
  {
    name: "Dell Inspiron 15 3520 i5 1235U",
    price: 14990000,
    oldPrice: 16990000,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/309584/dell-inspiron-15-3520-i5-n5i5052w1-600x600.jpg",
    cpu: "Intel Core i5",
    ram: "8GB RAM",
    storage: "512GB SSD",
    discount: "-11%",
  },
  {
    name: "MSI Gaming Thin GF63 i5 12450H",
    price: 17990000,
    oldPrice: 20990000,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/303889/msi-gaming-thin-gf63-12ve-i5-460vn-600x600.jpg",
    cpu: "Intel Core i5",
    ram: "8GB RAM",
    storage: "512GB SSD",
    discount: "-14%",
  },
  {
    name: "Asus Vivobook 15 OLED i5 13500H",
    price: 19990000,
    oldPrice: 22990000,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/309968/asus-vivobook-15-oled-a1505va-i5-l1114w-600x600.jpg",
    cpu: "Intel Core i5",
    ram: "16GB RAM",
    storage: "512GB SSD",
    discount: "-13%",
  },
  {
    name: "Lenovo IdeaPad Slim 5 i5 13420H",
    price: 16490000,
    oldPrice: 18990000,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/316039/lenovo-ideapad-slim-5-14irl8-i5-82xd006bvn-600x600.jpg",
    cpu: "Intel Core i5",
    ram: "16GB RAM",
    storage: "512GB SSD",
    discount: "-9%",
  },
];

const brands = ["Dell", "Asus", "Apple", "HP", "MSI", "Lenovo"];
const cpus = ["Intel Core i5", "Intel Core i7", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M2"];
const rams = ["8GB", "16GB", "32GB"];

function ProductListPage() {
  return (
    <>
      <Header />

      <main className="bg-[#f4f7ff]">
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 px-8 py-10 text-white shadow-lg">
            <p className="font-bold text-blue-100">Danh mục sản phẩm</p>

            <h1 className="mt-2 text-4xl font-extrabold">
              Tất cả Laptop
            </h1>

            <p className="mt-3 max-w-2xl text-blue-100">
              Lựa chọn laptop phù hợp với nhu cầu học tập, văn phòng, thiết kế
              đồ họa và gaming.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-gray-900">
                Bộ lọc sản phẩm
              </h2>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <h3 className="font-bold text-gray-800">Thương hiệu</h3>

                <div className="mt-3 space-y-3">
                  {brands.map((brand) => (
                    <label
                      key={brand}
                      className="flex cursor-pointer items-center gap-3 text-sm text-gray-600"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-700"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <h3 className="font-bold text-gray-800">CPU</h3>

                <div className="mt-3 space-y-3">
                  {cpus.map((cpu) => (
                    <label
                      key={cpu}
                      className="flex cursor-pointer items-center gap-3 text-sm text-gray-600"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-700"
                      />
                      {cpu}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <h3 className="font-bold text-gray-800">RAM</h3>

                <div className="mt-3 space-y-3">
                  {rams.map((ram) => (
                    <label
                      key={ram}
                      className="flex cursor-pointer items-center gap-3 text-sm text-gray-600"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-700"
                      />
                      {ram}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <h3 className="font-bold text-gray-800">Khoảng giá</h3>

                <div className="mt-3 space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">
                    <input type="radio" name="price" className="h-4 w-4 accent-blue-700" />
                    Dưới 15 triệu
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">
                    <input type="radio" name="price" className="h-4 w-4 accent-blue-700" />
                    15 - 20 triệu
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">
                    <input type="radio" name="price" className="h-4 w-4 accent-blue-700" />
                    Trên 20 triệu
                  </label>
                </div>
              </div>

              <button className="mt-7 w-full rounded-xl bg-blue-700 py-3 font-bold text-white transition hover:bg-blue-800">
                Áp dụng lọc
              </button>
            </aside>

            <section>
              <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    Danh sách laptop
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Hiển thị {products.length} sản phẩm phù hợp.
                  </p>
                </div>

                <select className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500">
                  <option>Sắp xếp mặc định</option>
                  <option>Giá thấp đến cao</option>
                  <option>Giá cao đến thấp</option>
                  <option>Sản phẩm mới nhất</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.name} {...product} />
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ProductListPage;