import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// 1. Import Axios Client
import { api } from "../../utils/api"; 

// Khai báo Type cơ bản để loại bỏ "any"
type OrderItem = {
  id: number;
  quantity: number;
  price: string | number;
  product: { name: string };
};

type OrderDetailType = {
  id: number;
  receiverName: string;
  phone: string;
  address: string;
  note: string | null;
  total: string | number;
  items: OrderItem[];
};

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 2. Tuyệt đối không tự lấy token thủ công. api.ts sẽ lo việc đó.
    // Dùng api.get thay vì fetch
    api.get(`/orders/${id}`)
      .then((res) => {
        // Dữ liệu từ axios tự động nằm trong res.data
        setOrder(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy chi tiết đơn hàng:", err);
        setError("Không thể tải chi tiết đơn hàng hoặc đơn hàng không tồn tại.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-500 font-medium">Đang tải dữ liệu...</div>;
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 underline">← Quay lại</button>
        <div className="text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-200">
          {error || "Đơn hàng không tồn tại."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 font-medium hover:underline">
        ← Quay lại danh sách
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chi tiết đơn hàng #{order.id}</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <p><strong className="text-gray-600">Khách hàng:</strong> {order.receiverName}</p>
          <p><strong className="text-gray-600">SĐT:</strong> {order.phone}</p>
          <p><strong className="text-gray-600">Địa chỉ:</strong> {order.address}</p>
          <p><strong className="text-gray-600">Ghi chú:</strong> {order.note || <span className="text-gray-400 italic">Không có</span>}</p>
        </div>
        
        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-4 border-b pb-2">Danh sách Sản phẩm</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 font-semibold text-gray-600">Tên sản phẩm</th>
              <th className="p-3 font-semibold text-gray-600">Số lượng</th>
              <th className="p-3 font-semibold text-gray-600 text-right">Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-800 font-medium">{item.product.name}</td>
                <td className="p-3 text-gray-600">{item.quantity}</td>
                <td className="p-3 text-right text-gray-800">{Number(item.price).toLocaleString("vi-VN")}₫</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="flex justify-end mt-6">
          <p className="text-xl text-gray-800">
            Tổng thanh toán: <span className="font-bold text-blue-600 ml-2">{Number(order.total).toLocaleString("vi-VN")}₫</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;