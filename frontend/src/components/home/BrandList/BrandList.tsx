import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../utils/api";

// Định nghĩa kiểu dữ liệu chuẩn xác
type BrandType = {
  id: number;
  name: string;
};

function BrandList() {
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy danh sách hãng thực tế từ Database
    api.get("/brands")
      .then((res) => {
        setBrands(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách thương hiệu:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Đang tải thương hiệu...</div>;
  }

  if (brands.length === 0) {
    return null; // Không hiển thị khối này nếu database chưa có hãng nào
  }

  return (
    <section className="mx-auto mt-12 max-w-7xl px-6">
      <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              // TRUYỀN ĐÚNG THAM SỐ brandId LÀM ĐIỀU KIỆN LỌC
              to={`/products?brandId=${brand.id}`}
              className="flex uppercase items-center justify-center text-center rounded-xl border border-gray-100 bg-gray-50 py-4 text-lg font-extrabold tracking-widest text-gray-400 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandList;