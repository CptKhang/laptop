import { Link } from "react-router-dom";

type ProductCardProps = {
  id?: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  cpu: string;
  ram: string;
  storage: string;
  discount?: string;
};

function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  cpu,
  ram,
  storage,
  discount,
}: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
      {discount && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
          {discount}
        </span>
      )}

      <Link to={`/products/${id ?? 1}`}>
        <div className="flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <img
            src={image}
            alt={name}
            className="max-h-36 object-contain transition duration-300 group-hover:scale-110"
          />
        </div>

        <h3 className="mt-4 line-clamp-2 min-h-[48px] text-base font-bold text-gray-900 hover:text-blue-700">
          {name}
        </h3>
      </Link>

      <div className="mt-3">
        <p className="text-2xl font-extrabold text-blue-700">
          {price.toLocaleString("vi-VN")}₫
        </p>

        {oldPrice && (
          <p className="mt-1 text-sm text-gray-400 line-through">
            {oldPrice.toLocaleString("vi-VN")}₫
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600">
        <div className="rounded-lg bg-gray-50 px-3 py-2">⚙ {cpu}</div>
        <div className="rounded-lg bg-gray-50 px-3 py-2">💾 {ram}</div>
        <div className="rounded-lg bg-gray-50 px-3 py-2">🖥 {storage}</div>
      </div>

      <Link 
        to="/cart" 
        className="mt-5 block w-full text-center rounded-xl bg-blue-700 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
      >
        Thêm vào giỏ
      </Link>
    </div>
  );
}

export default ProductCard;