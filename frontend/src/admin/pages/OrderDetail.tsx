import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api"; 

type OrderItem = {
  id: number;
  quantity: number;
  price: string | number;
  product: { name: string };
};

// 1. VÁ LỖ HỔNG TYPE: Bắt buộc phải khai báo các trường thanh toán
type OrderDetailType = {
  id: number;
  receiverName: string;
  phone: string;
  address: string;
  note: string | null;
  total: string | number;
  paymentMethod: 'COD' | 'MOMO';
  paymentStatus: 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';
  items: OrderItem[];
};

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => {
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
        
        {/* THÔNG TIN KHÁCH HÀNG */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <p><strong className="text-gray-600">Khách hàng:</strong> {order.receiverName}</p>
          <p><strong className="text-gray-600">SĐT:</strong> {order.phone}</p>
          <p><strong className="text-gray-600">Địa chỉ:</strong> {order.address}</p>
          <p><strong className="text-gray-600">Ghi chú:</strong> {order.note || <span className="text-gray-400 italic">Không có</span>}</p>
        </div>

        {/* 2. KHỐI THÔNG TIN THANH TOÁN MỚI ĐƯỢC CHÈN VÀO */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-md font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Thông tin thanh toán</h3>
          <div className="flex flex-col gap-3 text-sm">
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Phương thức:</span>
              <span className="font-bold text-gray-800">
                {order.paymentMethod === 'MOMO' ? 'Ví điện tử MoMo' : 'Thanh toán khi nhận hàng (COD)'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Trạng thái dòng tiền:</span>
              {order.paymentMethod === 'COD' ? (
                 <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold">
                   Chờ thu tiền khi giao
                 </span>
              ) : order.paymentStatus === 'PAID' ? (
                 <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                   Đã thanh toán (MoMo)
                 </span>
              ) : (
                 <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                   Chưa thanh toán / Thất bại
                 </span>
              )}
            </div>
          </div>
        </div>
        {/* KẾT THÚC KHỐI THANH TOÁN */}
        
        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-4 border-b pb-2">Danh sách Sản phẩm</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 font-semibold text-gray-600">Tên sản phẩm</th>
              <th className="p-3 font-semibold text-gray-600 text-center">Số lượng</th>
              <th className="p-3 font-semibold text-gray-600 text-right">Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-800 font-medium">{item.product.name}</td>
                <td className="p-3 text-gray-600 text-center">{item.quantity}</td>
                <td className="p-3 text-right text-gray-800">{Number(item.price).toLocaleString("vi-VN")}₫</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="flex justify-end mt-6 bg-blue-50 p-4 rounded-lg">
          <p className="text-xl text-gray-800">
            Tổng thanh toán: <span className="font-extrabold text-blue-700 ml-2">{Number(order.total).toLocaleString("vi-VN")}₫</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;