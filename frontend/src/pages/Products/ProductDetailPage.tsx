import { Heart, Minus, Plus, ShoppingCart, Star, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";

const products = [
  {
    id: 1,
    name: "MacBook Air M2 2022 13.6 inch 8GB/256GB",
    price: 26490000,
    oldPrice: 29990000,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/282827/apple-macbook-air-m2-2022-xanh-600x600.jpg",
    cpu: "Apple M2",
    ram: "8GB RAM",
    storage: "256GB SSD",
    screen: "13.6 inch Liquid Retina",
    gpu: "Apple GPU 8 nhân",
    warranty: "12 tháng chính hãng",
    description:
      "MacBook Air M2 có thiết kế mỏng nhẹ, hiệu năng mạnh mẽ, thời lượng pin tốt, phù hợp cho học tập, văn phòng và làm việc sáng tạo.",
  },
  {
    id: 2,
    name: "Asus TUF Gaming F15 FX506HF i5 11400H",
    price: 16990000,
    oldPrice: 19990000,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/269468/asus-tuf-gaming-fx506hf-i5-hn014w-600x600.jpg",
    cpu: "Intel Core i5",
    ram: "8GB RAM",
    storage: "512GB SSD",
    screen: "15.6 inch Full HD 144Hz",
    gpu: "NVIDIA GeForce RTX 2050",
    warranty: "24 tháng chính hãng",
    description:
      "Asus TUF Gaming F15 là mẫu laptop gaming bền bỉ, hiệu năng ổn định, phù hợp chơi game, học tập và làm việc đồ họa cơ bản.",
  },
  {
    id: 3,
    name: "Lenovo LOQ Gaming Ryzen 7 7840HS",
    price: 22990000,
    oldPrice: 24990000,
    image:
      "https://cdn.tgdd.vn/Products/Images/44/317507/lenovo-loq-15aph8-r7-82xt001tvn-600x600.jpg",
    cpu: "AMD Ryzen 7",
    ram: "16GB RAM",
    storage: "512GB SSD",
    screen: "15.6 inch Full HD 144Hz",
    gpu: "NVIDIA GeForce RTX 4050",
    warranty: "24 tháng chính hãng",
    description:
      "Lenovo LOQ Gaming sở hữu cấu hình mạnh, RAM 16GB và GPU RTX, phù hợp cho gaming, lập trình, thiết kế và xử lý đa nhiệm.",
  },
];

function ProductDetailPage() {
  const { id } = useParams();

  const product =
    products.find((item) => item.id === Number(id)) ?? products[0];

  return (
    <>
      <Header />

      <main className="bg-[#f4f7ff]">
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-700">
              Trang chủ
            </Link>{" "}
            /{" "}
            <Link to="/products" className="hover:text-blue-700">
              Sản phẩm
            </Link>{" "}
            / <span className="text-gray-800">{product.name}</span>
          </div>

          <div className="grid gap-8 rounded-3xl bg-white p-8 shadow-sm lg:grid-cols-2">
            <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
              <div className="flex min-h-[420px] items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-[360px] object-contain drop-shadow-xl"
                />
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                  Chính hãng
                </span>

                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">
                  Đang khuyến mãi
                </span>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight text-gray-900">
                {product.name}
              </h1>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex text-yellow-400">
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                </div>

                <span className="text-sm text-gray-500">
                  5.0 | 128 đánh giá
                </span>
              </div>

              <div className="mt-6">
                <p className="text-4xl font-extrabold text-blue-700">
                  {product.price.toLocaleString("vi-VN")}₫
                </p>

                <p className="mt-2 text-lg text-gray-400 line-through">
                  {product.oldPrice.toLocaleString("vi-VN")}₫
                </p>
              </div>

              <p className="mt-6 leading-relaxed text-gray-600">
                {product.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">CPU</p>
                  <p className="mt-1 font-bold text-gray-900">
                    {product.cpu}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">RAM</p>
                  <p className="mt-1 font-bold text-gray-900">
                    {product.ram}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Ổ cứng</p>
                  <p className="mt-1 font-bold text-gray-900">
                    {product.storage}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Màn hình</p>
                  <p className="mt-1 font-bold text-gray-900">
                    {product.screen}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <span className="font-semibold text-gray-700">Số lượng:</span>

                <div className="flex items-center rounded-xl border border-gray-200">
                  <button className="p-3 hover:text-blue-700">
                    <Minus size={16} />
                  </button>

                  <span className="px-4 font-bold">1</span>

                  <button className="p-3 hover:text-blue-700">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 py-4 font-bold text-white transition hover:bg-blue-800">
                  <ShoppingCart size={20} />
                  Thêm vào giỏ
                </button>

                <button className="rounded-xl border border-gray-200 px-5 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                  <Heart size={22} />
                </button>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-blue-700">
                <Truck size={22} />
                <p className="text-sm font-semibold">
                  Miễn phí giao hàng cho đơn hàng từ 10.000.000₫
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Thông số kỹ thuật
            </h2>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="w-1/3 bg-gray-50 px-5 py-4 font-bold text-gray-700">
                      CPU
                    </td>
                    <td className="px-5 py-4 text-gray-600">{product.cpu}</td>
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="bg-gray-50 px-5 py-4 font-bold text-gray-700">
                      RAM
                    </td>
                    <td className="px-5 py-4 text-gray-600">{product.ram}</td>
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="bg-gray-50 px-5 py-4 font-bold text-gray-700">
                      Ổ cứng
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {product.storage}
                    </td>
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="bg-gray-50 px-5 py-4 font-bold text-gray-700">
                      Card đồ họa
                    </td>
                    <td className="px-5 py-4 text-gray-600">{product.gpu}</td>
                  </tr>

                  <tr>
                    <td className="bg-gray-50 px-5 py-4 font-bold text-gray-700">
                      Bảo hành
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {product.warranty}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetailPage;