import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function OrderDetail() {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3000/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch((err) => console.error("Lỗi:", err));
  }, [id]);

  if (!order) return <div>Đang tải...</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 underline">← Quay lại</button>
      <h1 className="text-2xl font-bold mb-4">Chi tiết đơn hàng #{order.id}</h1>
      
      <div className="bg-white p-6 rounded shadow border">
        <p><strong>Khách hàng:</strong> {order.receiverName}</p>
        <p><strong>SĐT:</strong> {order.phone}</p>
        <p><strong>Địa chỉ:</strong> {order.address}</p>
        <p><strong>Ghi chú:</strong> {order.note || "Không có"}</p>
        
        <h2 className="text-lg font-bold mt-6 mb-2">Sản phẩm</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Giá</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.product.name}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">{Number(item.price).toLocaleString("vi-VN")}₫</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xl font-bold mt-4">Tổng tiền: {Number(order.total).toLocaleString("vi-VN")}₫</p>
      </div>
    </div>
  );
}

export default OrderDetail;