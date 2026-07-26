# Tài liệu tích hợp Backend API

Tài liệu này mô tả contract API hiện tại của backend NestJS trong dự án Laptop Shop. Nội dung được đối chiếu trực tiếp với controller, DTO, service và Prisma schema.

> Cập nhật theo source code ngày 26/07/2026.

## Mục lục

1. [Cấu hình chung](#1-cấu-hình-chung)
2. [Xác thực và phân quyền](#2-xác-thực-và-phân-quyền)
3. [Quy ước dữ liệu](#3-quy-ước-dữ-liệu)
4. [Auth API](#4-auth-api)
5. [Users API](#5-users-api)
6. [Products API](#6-products-api)
7. [Categories API](#7-categories-api)
8. [Brands API](#8-brands-api)
9. [Cart API](#9-cart-api)
10. [Orders API](#10-orders-api)
11. [Return/Exchange API](#11-returnexchange-api)
12. [Admin Dashboard API](#12-admin-dashboard-api)
13. [Luồng tích hợp đề xuất](#13-luồng-tích-hợp-đề-xuất)
14. [Các điểm frontend hiện tại cần sửa](#14-các-điểm-frontend-hiện-tại-cần-sửa)
15. [Danh sách toàn bộ endpoint](#15-danh-sách-toàn-bộ-endpoint)

---

## 1. Cấu hình chung

### 1.1 Base URL

```text
http://localhost:3000
```

Backend đọc cổng từ biến môi trường `PORT`, mặc định là `3000`.

Không có global prefix `/api`, vì vậy endpoint đăng nhập là:

```text
http://localhost:3000/auth/login
```

không phải:

```text
http://localhost:3000/api/auth/login
```

### 1.2 CORS

Backend hiện chỉ cho phép origin:

```text
http://localhost:5173
```

và bật:

```text
credentials: true
```

Nếu frontend chạy ở domain hoặc port khác, cần cập nhật cấu hình CORS trong backend.

### 1.3 Content type

Các request có body phải gửi:

```http
Content-Type: application/json
```

### 1.4 Validation toàn cục

Backend dùng `ValidationPipe` với các tùy chọn:

```ts
{
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true
}
```

Hệ quả khi tích hợp:

- Field không được định nghĩa trong DTO sẽ bị từ chối với `400 Bad Request`.
- Không gửi thêm field tùy ý trong request body.
- Một số query/body number được tự chuyển từ string sang number.
- Các endpoint dùng `ParseIntPipe` sẽ trả `400` nếu path ID không phải số nguyên.
- Các endpoint cũ dùng `+id` có thể trả lỗi không đồng nhất nếu ID sai định dạng.

Ví dụ body tạo đơn hàng sau đây **không hợp lệ** vì `price` không thuộc `OrderItemDto`:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 25000000
    }
  ]
}
```

Body đúng:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

### 1.5 HTTP status thành công

Backend đang sử dụng status mặc định của NestJS:

| Method | Status mặc định |
|---|---:|
| `GET` | `200 OK` |
| `PATCH` | `200 OK` |
| `DELETE` | `200 OK` |
| `POST` | `201 Created` |

Do đó các endpoint login hiện trả `201`, không phải `200`.

### 1.6 Dạng lỗi phổ biến

Lỗi nghiệp vụ thường có dạng:

```json
{
  "statusCode": 400,
  "message": "Chuyển trạng thái đơn hàng không hợp lệ",
  "error": "Bad Request"
}
```

Lỗi validation có thể trả `message` là mảng:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "Mật khẩu phải có từ 6 đến 72 ký tự"
  ],
  "error": "Bad Request"
}
```

Các mã lỗi client cần xử lý:

| Status | Ý nghĩa |
|---:|---|
| `400` | Payload/query/path không hợp lệ hoặc vi phạm state machine |
| `401` | Chưa đăng nhập, token sai/hết hạn hoặc sai thông tin đăng nhập |
| `403` | Đã đăng nhập nhưng không có quyền hoặc không sở hữu tài nguyên |
| `404` | Không tìm thấy tài nguyên |
| `409` | Xung đột dữ liệu, ví dụ email hoặc yêu cầu đổi trả đang tồn tại |
| `500` | Lỗi server hoặc một số lỗi Prisma chưa được chuẩn hóa |

### 1.7 Axios client đề xuất

```ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
    }

    return Promise.reject(error);
  },
);
```

---

## 2. Xác thực và phân quyền

### 2.1 Các mức truy cập

| Ký hiệu | Yêu cầu |
|---|---|
| Public | Không cần token |
| User | Bearer token hợp lệ |
| Admin | Bearer token của tài khoản có role `ADMIN` |

### 2.2 Authorization header

```http
Authorization: Bearer <access_token>
```

Ví dụ:

```bash
curl http://localhost:3000/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### 2.3 JWT payload và thời hạn

Token được ký với payload:

```json
{
  "sub": 7,
  "email": "buyer@example.com",
  "role": "USER"
}
```

Thời hạn token hiện tại là **7 ngày**.

Mỗi request có JWT sẽ đọc lại user từ database. Nếu user đã bị xóa, request trả `401` ngay cả khi token chưa hết hạn.

### 2.4 Tách customer và admin login

- Customer đăng nhập tại `POST /auth/login`.
- Admin đăng nhập tại `POST /admin/auth/login`.
- Customer không đăng nhập được qua endpoint admin.
- Admin không đăng nhập được qua endpoint customer.

---

## 3. Quy ước dữ liệu

### 3.1 Enums

```ts
type Role = 'USER' | 'ADMIN';

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'COMPLETED'
  | 'CANCELLED';

type PaymentMethod = 'COD' | 'MOMO';

type ReturnRequestType = 'RETURN' | 'EXCHANGE';

type ReturnRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';
```

> Backend không có trạng thái `DELIVERED`. Trạng thái giao hàng hoàn tất là `COMPLETED`.

### 3.2 Pagination response

Products, orders và return requests trả dữ liệu phân trang theo dạng:

```ts
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

Ví dụ:

```json
{
  "items": [],
  "total": 21,
  "page": 2,
  "limit": 20,
  "totalPages": 2
}
```

Không xử lý response phân trang như một array trực tiếp. Dữ liệu nằm trong `response.data.items`.

### 3.3 Decimal

Các field Prisma Decimal:

- `Product.price`
- `Order.total`
- `OrderItem.price`
- `totalRevenue`

Khi serialize JSON, giá trị có thể là string:

```json
{
  "price": "25990000.0000"
}
```

Frontend nên chuẩn hóa:

```ts
const price = Number(product.price);
```

Không dùng số thực JavaScript cho các phép tính thanh toán quan trọng. Tổng tiền cuối cùng luôn lấy từ backend.

### 3.4 Kiểu dữ liệu tham khảo

```ts
interface UserPublic {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  image: string;
  cpu: string | null;
  ram: string | null;
  storage: string | null;
  screen: string | null;
  gpu: string | null;
  warranty: string | null;
  categoryId: number;
  brandId: number;
  category?: Category;
  brand?: Brand;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string | number;
  product?: Product;
}

interface Order {
  id: number;
  userId: number;
  receiverName: string;
  phone: string;
  address: string;
  note: string | null;
  total: string | number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  orderCode?: string;
}

interface ReturnRequest {
  id: number;
  orderId: number;
  activeOrderId: number | null;
  userId: number;
  type: ReturnRequestType;
  reason: string;
  status: ReturnRequestStatus;
  adminNote: string | null;
  reviewedById: number | null;
  reviewedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  user?: UserPublic;
  reviewedBy?: UserPublic | null;
}
```

`activeOrderId` hiện vẫn xuất hiện trong JSON response của return request, nhưng là field nội bộ dùng để bảo đảm chỉ có một yêu cầu đổi trả đang hoạt động trên mỗi đơn. Frontend không nên đọc, hiển thị hoặc phụ thuộc vào field này.

---

## 4. Auth API

### 4.1 Đăng ký customer

```http
POST /auth/register
```

**Access:** Public

#### Request body

```json
{
  "fullName": "Nguyễn Văn An",
  "email": "buyer@example.com",
  "password": "12345678",
  "phone": "0901234567",
  "address": "123 Nguyễn Trãi, Quận 1, TP.HCM"
}
```

| Field | Bắt buộc | Validation |
|---|---|---|
| `fullName` | Có | String, trim, 2–100 ký tự |
| `email` | Có | Email hợp lệ, trim và lowercase |
| `password` | Có | String, 6–72 ký tự |
| `phone` | Không | `+` tùy chọn, sau đó 9–15 chữ số |
| `address` | Không | String, trim, tối đa 500 ký tự |

Không gửi `role`. Public registration luôn tạo `Role.USER`.

#### Response `201 Created`

```json
{
  "message": "Đăng ký thành công",
  "data": {
    "id": 7,
    "email": "buyer@example.com",
    "fullName": "Nguyễn Văn An",
    "phone": "0901234567",
    "address": "123 Nguyễn Trãi, Quận 1, TP.HCM",
    "role": "USER",
    "createdAt": "2026-07-26T12:00:00.000Z",
    "updatedAt": "2026-07-26T12:00:00.000Z"
  }
}
```

Password hash không được trả về.

#### Lỗi

- `400`: body không hợp lệ hoặc chứa field ngoài DTO.
- `409`: email đã tồn tại, bao gồm trường hợp hai request đăng ký đồng thời.

#### cURL

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn An",
    "email": "buyer@example.com",
    "password": "12345678",
    "phone": "0901234567",
    "address": "123 Nguyễn Trãi, Quận 1, TP.HCM"
  }'
```

### 4.2 Đăng nhập customer

```http
POST /auth/login
```

**Access:** Public, chỉ tài khoản `USER`

#### Request body

```json
{
  "email": "buyer@example.com",
  "password": "12345678"
}
```

| Field | Validation |
|---|---|
| `email` | Email hợp lệ, trim, lowercase |
| `password` | String, 6–72 ký tự |

#### Response `201 Created`

```json
{
  "message": "Đăng nhập thành công",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 7,
    "email": "buyer@example.com",
    "fullName": "Nguyễn Văn An",
    "phone": "0901234567",
    "address": "123 Nguyễn Trãi, Quận 1, TP.HCM",
    "role": "USER",
    "createdAt": "2026-07-26T12:00:00.000Z",
    "updatedAt": "2026-07-26T12:00:00.000Z"
  }
}
```

#### Lỗi

- `400`: DTO không hợp lệ.
- `401`: email/password sai hoặc tài khoản có role `ADMIN`.

### 4.3 Đăng nhập admin

```http
POST /admin/auth/login
```

**Access:** Public, chỉ tài khoản `ADMIN`

Request và response giống customer login.

#### Lỗi

- `401`: email/password sai hoặc tài khoản có role `USER`.

#### cURL

```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

---

## 5. Users API

### 5.1 Lấy profile hiện tại

```http
GET /users/me
```

**Access:** User/Admin

#### Response `200 OK`

```json
{
  "id": 7,
  "email": "buyer@example.com",
  "fullName": "Nguyễn Văn An",
  "phone": "0901234567",
  "address": "123 Nguyễn Trãi, Quận 1, TP.HCM",
  "role": "USER",
  "createdAt": "2026-07-26T12:00:00.000Z",
  "updatedAt": "2026-07-26T12:00:00.000Z"
}
```

#### Lỗi

- `401`: token thiếu, sai, hết hạn hoặc tài khoản không còn tồn tại.

### 5.2 Cập nhật profile

```http
PATCH /users/me
```

**Access:** User/Admin

Tất cả field đều optional, nhưng body chỉ được chứa:

```json
{
  "fullName": "Nguyễn Văn Bình",
  "phone": "0912345678",
  "address": "456 Lê Lợi, Quận 3, TP.HCM"
}
```

| Field | Validation |
|---|---|
| `fullName` | Trim, string, 2–100 ký tự |
| `phone` | Trim, `+` tùy chọn và 9–15 chữ số |
| `address` | Trim, string, tối đa 500 ký tự |

Không được cập nhật qua endpoint này:

- `email`
- `password`
- `role`
- `id`

Nếu gửi các field trên, backend trả `400` vì `forbidNonWhitelisted`.

#### Response `200 OK`

```json
{
  "id": 7,
  "fullName": "Nguyễn Văn Bình",
  "email": "buyer@example.com",
  "phone": "0912345678",
  "address": "456 Lê Lợi, Quận 3, TP.HCM",
  "role": "USER"
}
```

### 5.3 Danh sách users

```http
GET /users
```

**Access:** Admin

#### Response `200 OK`

```json
[
  {
    "id": 7,
    "fullName": "Nguyễn Văn An",
    "email": "buyer@example.com",
    "phone": "0901234567",
    "address": "123 Nguyễn Trãi, Quận 1, TP.HCM",
    "role": "USER",
    "createdAt": "2026-07-26T12:00:00.000Z"
  }
]
```

Danh sách được sắp theo `createdAt desc`. Password không được trả về.

---

## 6. Products API

### 6.1 Danh sách sản phẩm

```http
GET /products
```

**Access:** Public

#### Query parameters

| Query | Type | Mô tả |
|---|---|---|
| `search` | string | Tìm trong tên sản phẩm |
| `categoryId` | number | Lọc category ID |
| `brandId` | number | Lọc brand ID |
| `cpu` | string | Lọc chính xác CPU |
| `ram` | string | Lọc chính xác RAM |
| `minPrice` | number | Giá tối thiểu |
| `maxPrice` | number | Giá tối đa |
| `sort` | string | `price_asc`, `price_desc`, `newest` |
| `page` | number | Mặc định `1` |
| `limit` | number | Mặc định `12` |

Product query DTO hiện chưa giới hạn `page`, `limit` và chưa validate enum cho `sort`. Client vẫn nên chỉ gửi giá trị hợp lệ.

#### Ví dụ

```http
GET /products?search=macbook&brandId=1&minPrice=20000000&sort=price_asc&page=1&limit=12
```

#### Response `200 OK`

```json
{
  "items": [
    {
      "id": 1,
      "name": "MacBook Air M3",
      "description": "Laptop Apple MacBook Air M3",
      "price": "27990000.0000",
      "stock": 10,
      "image": "https://example.com/macbook-air-m3.jpg",
      "cpu": "Apple M3",
      "ram": "16GB",
      "storage": "512GB SSD",
      "screen": "13.6 inch",
      "gpu": "Apple GPU",
      "warranty": "12 tháng",
      "categoryId": 1,
      "brandId": 1,
      "createdAt": "2026-07-26T12:00:00.000Z",
      "updatedAt": "2026-07-26T12:00:00.000Z",
      "category": {
        "id": 1,
        "name": "Ultrabook"
      },
      "brand": {
        "id": 1,
        "name": "Apple"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 12,
  "totalPages": 1
}
```

### 6.2 Chi tiết sản phẩm

```http
GET /products/:id
```

**Access:** Public

#### Response `200 OK`

Trả một `Product` kèm:

```json
{
  "category": {
    "id": 1,
    "name": "Ultrabook"
  },
  "brand": {
    "id": 1,
    "name": "Apple"
  }
}
```

#### Lỗi

- `404`: sản phẩm không tồn tại.

### 6.3 Tạo sản phẩm

```http
POST /products
```

**Access:** Admin

#### Request body

```json
{
  "name": "MacBook Air M3",
  "description": "Laptop Apple MacBook Air M3",
  "price": 27990000,
  "stock": 10,
  "image": "https://example.com/macbook-air-m3.jpg",
  "cpu": "Apple M3",
  "ram": "16GB",
  "storage": "512GB SSD",
  "screen": "13.6 inch",
  "gpu": "Apple GPU",
  "warranty": "12 tháng",
  "categoryId": 1,
  "brandId": 1
}
```

| Field | Bắt buộc | Validation |
|---|---|---|
| `name` | Có | String, không rỗng |
| `description` | Có | String, không rỗng |
| `price` | Có | Number, `>= 0` |
| `stock` | Có | Number, `>= 0` |
| `image` | Có | String, không rỗng |
| `categoryId` | Có | Number |
| `brandId` | Có | Number |
| `cpu` | Không | String |
| `ram` | Không | String |
| `storage` | Không | String |
| `screen` | Không | String |
| `gpu` | Không | String |
| `warranty` | Không | String |

#### Response `201 Created`

Trả product vừa tạo kèm full relation `category` và `brand`.

#### Lỗi

- `400`: validation sai.
- `401`: chưa đăng nhập.
- `403`: không phải admin.
- Category/brand không tồn tại có thể trả lỗi Prisma chưa được chuẩn hóa.

### 6.4 Cập nhật sản phẩm

```http
PATCH /products/:id
```

**Access:** Admin

Body dùng các field của create product nhưng tất cả đều optional.

```json
{
  "price": 26990000,
  "stock": 15
}
```

#### Response `200 OK`

Trả product đã cập nhật kèm category và brand.

#### Lỗi

- `404`: product không tồn tại.
- `400`, `401`, `403` tùy trường hợp.

> Backend không có `PUT /products/:id`. Frontend phải dùng `PATCH`.

### 6.5 Xóa sản phẩm

```http
DELETE /products/:id
```

**Access:** Admin

#### Response `200 OK`

Trả record product đã xóa.

#### Lỗi

- `404`: product không tồn tại.
- Có thể không xóa được nếu product đã được tham chiếu bởi order item.

---

## 7. Categories API

### 7.1 Danh sách category

```http
GET /categories
```

**Access:** Public

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "name": "Gaming"
  },
  {
    "id": 2,
    "name": "Ultrabook"
  }
]
```

Sắp theo tên tăng dần.

### 7.2 Tạo category

```http
POST /categories
```

**Access:** Admin

```json
{
  "name": "Workstation"
}
```

`name` phải là string và không rỗng.

#### Response `201 Created`

```json
{
  "id": 3,
  "name": "Workstation"
}
```

### 7.3 Cập nhật category

```http
PATCH /categories/:id
```

**Access:** Admin

```json
{
  "name": "Laptop Workstation"
}
```

#### Response `200 OK`

Trả category đã cập nhật.

#### Lỗi

- `404`: category không tồn tại.

### 7.4 Xóa category

```http
DELETE /categories/:id
```

**Access:** Admin

#### Response `200 OK`

Trả category đã xóa.

Có thể không xóa được nếu category đang được product sử dụng.

---

## 8. Brands API

### 8.1 Danh sách brand

```http
GET /brands
```

**Access:** Public

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "name": "Apple"
  },
  {
    "id": 2,
    "name": "Dell"
  }
]
```

Sắp theo tên tăng dần.

### 8.2 Tạo brand

```http
POST /brands
```

**Access:** Admin

```json
{
  "name": "Lenovo"
}
```

#### Response `201 Created`

Trả brand vừa tạo.

### 8.3 Cập nhật brand

```http
PATCH /brands/:id
```

**Access:** Admin

```json
{
  "name": "Lenovo Think"
}
```

#### Response `200 OK`

Trả brand đã cập nhật.

#### Lỗi

- `404`: brand không tồn tại.

### 8.4 Xóa brand

```http
DELETE /brands/:id
```

**Access:** Admin

#### Response `200 OK`

Trả brand đã xóa.

Có thể không xóa được nếu brand đang được product sử dụng.

---

## 9. Cart API

Tất cả endpoint cart yêu cầu Bearer token.

Cart không giữ chỗ và không trừ tồn kho. Stock chỉ bị trừ khi tạo order thành công.

### 9.1 Lấy giỏ hàng

```http
GET /cart
```

**Access:** User/Admin

Nếu user chưa có cart, backend tự tạo cart rỗng.

#### Response `200 OK`

```json
{
  "id": 5,
  "userId": 7,
  "createdAt": "2026-07-26T12:00:00.000Z",
  "updatedAt": "2026-07-26T12:00:00.000Z",
  "items": [
    {
      "id": 10,
      "cartId": 5,
      "productId": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "MacBook Air M3",
        "price": "27990000.0000",
        "stock": 10,
        "category": {
          "id": 1,
          "name": "Ultrabook"
        },
        "brand": {
          "id": 1,
          "name": "Apple"
        }
      }
    }
  ]
}
```

Items được sắp theo item ID tăng dần.

### 9.2 Thêm sản phẩm vào cart

```http
POST /cart/items
```

**Access:** User/Admin

#### Request body

```json
{
  "productId": 1,
  "quantity": 2
}
```

`quantity` phải là number và `>= 1`.

Nếu sản phẩm đã có trong cart, backend cộng thêm quantity thay vì tạo dòng mới.

#### Response `201 Created`

Trả `CartItem` kèm product/category/brand.

#### Lỗi

- `404`: product không tồn tại.
- `400`: tổng quantity vượt stock hiện tại.

### 9.3 Cập nhật quantity

```http
PATCH /cart/items/:id
```

**Access:** User/Admin

`:id` là cart item ID, không phải product ID.

```json
{
  "quantity": 3
}
```

#### Response `200 OK`

Trả `CartItem` đã cập nhật kèm product/category/brand.

#### Lỗi

- `404`: item không tồn tại hoặc không thuộc cart của user.
- `400`: quantity vượt stock.

### 9.4 Xóa item khỏi cart

```http
DELETE /cart/items/:id
```

**Access:** User/Admin

#### Response `200 OK`

Trả `CartItem` đã xóa.

#### Lỗi

- `404`: item không tồn tại hoặc không thuộc user.

---

## 10. Orders API

### 10.1 Order state machine

```text
PENDING ──────> CONFIRMED ──────> SHIPPING ──────> COMPLETED
   │
   └──────────> CANCELLED
```

Transition hợp lệ:

| Trạng thái hiện tại | Trạng thái tiếp theo |
|---|---|
| `PENDING` | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | `SHIPPING` |
| `SHIPPING` | `COMPLETED` |
| `COMPLETED` | Không có |
| `CANCELLED` | Không có |

### 10.2 Tạo đơn hàng

```http
POST /orders
```

**Access:** User/Admin

#### Request body

```json
{
  "receiverName": "Nguyễn Văn An",
  "phone": "0901234567",
  "address": "123 Nguyễn Trãi, Quận 1, TP.HCM",
  "note": "Giao giờ hành chính",
  "paymentMethod": "COD",
  "items": [
    {
      "productId": 1,
      "quantity": 1
    },
    {
      "productId": 2,
      "quantity": 2
    }
  ]
}
```

| Field | Bắt buộc | Validation |
|---|---|---|
| `receiverName` | Có | Trim, string, 2–100 ký tự |
| `phone` | Có | `+` tùy chọn và 9–15 chữ số |
| `address` | Có | Trim, string, 1–500 ký tự |
| `note` | Không | Trim, string, tối đa 1000 ký tự |
| `paymentMethod` | Không | `COD` hoặc `MOMO`, mặc định `COD` |
| `items` | Có | Array có ít nhất 1 item |
| `items[].productId` | Có | Số nguyên `>= 1` |
| `items[].quantity` | Có | Số nguyên `>= 1` |

Không gửi:

- `price`
- `total`
- `status`
- `userId`

Backend đọc giá hiện tại từ database và tự tính tổng tiền.

#### Response `201 Created`

```json
{
  "id": 15,
  "userId": 7,
  "receiverName": "Nguyễn Văn An",
  "phone": "0901234567",
  "address": "123 Nguyễn Trãi, Quận 1, TP.HCM",
  "note": "Giao giờ hành chính",
  "total": "55980000.0000",
  "status": "PENDING",
  "paymentMethod": "COD",
  "completedAt": null,
  "cancelledAt": null,
  "cancelReason": null,
  "createdAt": "2026-07-26T12:00:00.000Z",
  "updatedAt": "2026-07-26T12:00:00.000Z",
  "items": [
    {
      "id": 30,
      "orderId": 15,
      "productId": 1,
      "quantity": 1,
      "price": "27990000.0000",
      "product": {
        "id": 1,
        "name": "MacBook Air M3"
      }
    }
  ],
  "orderCode": "TB15"
}
```

#### Side effects

Trong một transaction, backend:

1. Kiểm tra product ID.
2. Từ chối product bị lặp trong cùng request.
3. Đọc giá hiện tại từ database.
4. Kiểm tra và trừ stock có điều kiện.
5. Tạo order và order items.
6. Ghi lịch sử trạng thái ban đầu `PENDING`.

Nếu bất kỳ bước nào lỗi, transaction rollback.

Backend không tự đọc hoặc clear cart. Sau khi tạo order thành công, frontend cần chủ động xử lý cart nếu muốn.

#### Lỗi

- `400`: items rỗng, product lặp, thiếu stock hoặc body sai.
- `404`: một product không tồn tại.
- `401`: token không hợp lệ.

### 10.3 Danh sách đơn hàng

```http
GET /orders
```

**Access:** User/Admin

- User chỉ nhận đơn của mình.
- Admin nhận tất cả đơn.

#### Query parameters

| Query | Validation | Mặc định |
|---|---|---:|
| `page` | Integer `>= 1` | `1` |
| `limit` | Integer `1..100` | `20` |
| `status` | `OrderStatus` | Không lọc |

Ví dụ:

```http
GET /orders?page=1&limit=20&status=PENDING
```

#### Response `200 OK`

```json
{
  "items": [
    {
      "id": 15,
      "userId": 7,
      "receiverName": "Nguyễn Văn An",
      "total": "55980000.0000",
      "status": "PENDING",
      "paymentMethod": "COD",
      "items": [
        {
          "productId": 1,
          "quantity": 1,
          "price": "27990000.0000",
          "product": {
            "id": 1,
            "name": "MacBook Air M3"
          }
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 10.4 Chi tiết đơn hàng

```http
GET /orders/:id
```

**Access:** Owner/Admin

#### Response `200 OK`

Trả order kèm `items[].product`.

#### Lỗi

- `400`: ID không phải số nguyên.
- `403`: user không sở hữu order.
- `404`: order không tồn tại.

### 10.5 Lịch sử trạng thái đơn hàng

```http
GET /orders/:id/status-history
```

**Access:** Owner/Admin

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "orderId": 15,
    "fromStatus": null,
    "toStatus": "PENDING",
    "actorUserId": 7,
    "reason": null,
    "createdAt": "2026-07-26T12:00:00.000Z",
    "actor": {
      "id": 7,
      "fullName": "Nguyễn Văn An",
      "role": "USER"
    }
  },
  {
    "id": 2,
    "orderId": 15,
    "fromStatus": "PENDING",
    "toStatus": "CONFIRMED",
    "actorUserId": 1,
    "reason": null,
    "createdAt": "2026-07-26T13:00:00.000Z",
    "actor": {
      "id": 1,
      "fullName": "Admin",
      "role": "ADMIN"
    }
  }
]
```

Sắp theo `createdAt asc`.

### 10.6 Customer hủy đơn

```http
POST /orders/:id/cancel
```

**Access:** Owner

Chỉ hủy được order `PENDING`.

#### Request body

```json
{
  "reason": "Tôi muốn thay đổi sản phẩm"
}
```

`reason` được trim và phải dài 5–500 ký tự.

#### Response `201 Created`

Trả order đã chuyển thành `CANCELLED`, kèm items/product.

#### Side effects

Trong một transaction:

- Cập nhật status thành `CANCELLED`.
- Ghi `cancelledAt`.
- Ghi `cancelReason`.
- Hoàn stock đúng một lần.
- Tạo status history.

#### Lỗi

- `400`: ID sai, order không còn `PENDING` hoặc có concurrent update.
- `403`: không sở hữu order.
- `404`: order không tồn tại.

### 10.7 Admin cập nhật trạng thái đơn

```http
PATCH /orders/:id/status
```

**Access:** Admin

#### Request body

```json
{
  "status": "CONFIRMED"
}
```

Hoặc khi hủy:

```json
{
  "status": "CANCELLED",
  "reason": "Không thể xác nhận thông tin người nhận"
}
```

| Field | Bắt buộc | Validation |
|---|---|---|
| `status` | Có | Enum `OrderStatus` |
| `reason` | Khi hủy | Trim, string, tối đa 500 ký tự |

#### Response `200 OK`

Trả order sau cập nhật, kèm items/product.

#### Side effects

- Kiểm tra state machine.
- Ghi admin hiện tại làm actor.
- Ghi status history.
- Khi `COMPLETED`, đặt `completedAt`.
- Khi admin hủy order `PENDING`, đặt `cancelledAt`, `cancelReason` và hoàn stock.
- Dùng status hiện tại trong điều kiện update để chống concurrent transition.

#### Lỗi

- `400`: transition sai, thiếu lý do hủy hoặc trạng thái đã bị request khác đổi.
- `404`: order không tồn tại.

---

## 11. Return/Exchange API

Workflow áp dụng cho toàn bộ order, không áp dụng riêng từng order item.

Backend hiện chỉ quản lý yêu cầu và trạng thái. Backend **không tự động**:

- tạo refund;
- gọi payment gateway;
- hoàn tồn kho khi return hoàn tất;
- tạo replacement order;
- tạo quy trình shipping đổi/trả.

### 11.1 Return request state machine

```text
PENDING ──────> APPROVED ──────> COMPLETED
   │
   └──────────> REJECTED
```

| Trạng thái hiện tại | Trạng thái tiếp theo |
|---|---|
| `PENDING` | `APPROVED`, `REJECTED` |
| `APPROVED` | `COMPLETED` |
| `REJECTED` | Không có |
| `COMPLETED` | Không có |

### 11.2 Customer tạo yêu cầu đổi/trả

```http
POST /return-requests
```

**Access:** User/Admin, nhưng order phải thuộc user đang gọi

#### Request body

```json
{
  "orderId": 15,
  "type": "RETURN",
  "reason": "Máy bị lỗi màn hình sau khi nhận hàng"
}
```

| Field | Validation |
|---|---|
| `orderId` | Integer `>= 1` |
| `type` | `RETURN` hoặc `EXCHANGE` |
| `reason` | Trim, string, 10–1000 ký tự |

#### Điều kiện hợp lệ

- Order tồn tại.
- Order thuộc user hiện tại.
- Order có status `COMPLETED`.
- Order có `completedAt`.
- Thời điểm tạo yêu cầu không vượt quá `completedAt + 168 giờ`.
- Tại thời điểm đúng 168 giờ vẫn hợp lệ.
- Sau deadline 1 ms sẽ bị từ chối.
- Không có yêu cầu `PENDING` hoặc `APPROVED` khác cho cùng order.

Sau khi yêu cầu cũ `REJECTED` hoặc `COMPLETED`, customer có thể tạo yêu cầu mới nếu vẫn còn trong thời hạn.

#### Response `201 Created`

```json
{
  "id": 3,
  "orderId": 15,
  "activeOrderId": 15,
  "userId": 7,
  "type": "RETURN",
  "reason": "Máy bị lỗi màn hình sau khi nhận hàng",
  "status": "PENDING",
  "adminNote": null,
  "reviewedById": null,
  "reviewedAt": null,
  "completedAt": null,
  "createdAt": "2026-07-26T12:00:00.000Z",
  "updatedAt": "2026-07-26T12:00:00.000Z",
  "order": {
    "id": 15,
    "status": "COMPLETED"
  }
}
```

#### Lỗi

- `400`: order chưa `COMPLETED`, thiếu `completedAt`, quá 168 giờ hoặc body sai.
- `403`: order không thuộc user.
- `404`: order không tồn tại.
- `409`: đã có yêu cầu `PENDING`/`APPROVED`, bao gồm race giữa hai request đồng thời.

### 11.3 Customer xem danh sách yêu cầu

```http
GET /return-requests
```

**Access:** User/Admin

Luôn lọc theo `req.user.id`. Admin gọi endpoint này cũng chỉ thấy yêu cầu do chính tài khoản admin tạo. Admin xem toàn bộ bằng `/admin/return-requests`.

#### Query parameters

| Query | Validation | Mặc định |
|---|---|---:|
| `page` | Integer `>= 1` | `1` |
| `limit` | Integer `1..100` | `20` |
| `status` | `ReturnRequestStatus` | Không lọc |

#### Response `200 OK`

```json
{
  "items": [
    {
      "id": 3,
      "orderId": 15,
      "userId": 7,
      "type": "RETURN",
      "reason": "Máy bị lỗi màn hình sau khi nhận hàng",
      "status": "PENDING",
      "order": {
        "id": 15,
        "status": "COMPLETED",
        "total": "27990000.0000"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 11.4 Customer xem chi tiết yêu cầu

```http
GET /return-requests/:id
```

**Access:** Request owner

#### Response `200 OK`

Trả return request kèm:

- order;
- order items;
- product của từng item.

#### Lỗi

- `400`: ID không phải số nguyên.
- `403`: không sở hữu request.
- `404`: request không tồn tại.

### 11.5 Admin xem toàn bộ yêu cầu

```http
GET /admin/return-requests
```

**Access:** Admin

Query giống customer list.

#### Response `200 OK`

```json
{
  "items": [
    {
      "id": 3,
      "orderId": 15,
      "userId": 7,
      "type": "RETURN",
      "reason": "Máy bị lỗi màn hình sau khi nhận hàng",
      "status": "PENDING",
      "order": {
        "id": 15,
        "status": "COMPLETED"
      },
      "user": {
        "id": 7,
        "email": "buyer@example.com",
        "fullName": "Nguyễn Văn An",
        "role": "USER"
      },
      "reviewedBy": null
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

User và reviewer được select an toàn, không có password hash.

### 11.6 Admin xem chi tiết yêu cầu

```http
GET /admin/return-requests/:id
```

**Access:** Admin

#### Response `200 OK`

Trả request kèm:

- order;
- order items/product;
- customer an toàn;
- reviewer an toàn.

#### Lỗi

- `400`: ID không phải số nguyên.
- `404`: request không tồn tại.

### 11.7 Admin cập nhật trạng thái yêu cầu

```http
PATCH /admin/return-requests/:id/status
```

**Access:** Admin

#### Request body

```json
{
  "status": "APPROVED",
  "adminNote": "Chấp nhận đổi trả, vui lòng gửi máy về trung tâm"
}
```

| Field | Bắt buộc | Validation |
|---|---|---|
| `status` | Có | Enum `ReturnRequestStatus` |
| `adminNote` | Không | Trim, string, tối đa 1000 ký tự |

#### Response `200 OK`

Trả admin detail của request sau cập nhật.

#### Side effects

- Kiểm tra state machine.
- Lưu `reviewedById` là admin hiện tại.
- Khi `APPROVED` hoặc `REJECTED`, đặt `reviewedAt`.
- Khi `COMPLETED`, đặt `completedAt`.
- Khi `REJECTED` hoặc `COMPLETED`, giải phóng active lock để order có thể tạo request mới.
- Dùng status cũ trong update condition để chống concurrent transition.

#### Lỗi

- `400`: transition sai hoặc trạng thái đã bị request khác cập nhật.
- `404`: request không tồn tại.

---

## 12. Admin Dashboard API

### 12.1 Dashboard thống kê

```http
GET /admin/dashboard
```

**Access:** Admin

#### Response `200 OK`

```json
{
  "totalProducts": 120,
  "todayOrders": 8,
  "totalRevenue": "358900000.0000"
}
```

| Field | Ý nghĩa |
|---|---|
| `totalProducts` | Tổng số product |
| `todayOrders` | Số order có `createdAt` từ đầu ngày của server |
| `totalRevenue` | Tổng `Order.total` của tất cả order không có status `CANCELLED` |

`totalRevenue` không chỉ tính order `COMPLETED` và không chỉ tính doanh thu hôm nay.

---

## 13. Luồng tích hợp đề xuất

### 13.1 Customer registration/login

```text
POST /auth/register
        │
        ├── 201: chuyển sang màn hình login
        └── 409: hiển thị email đã tồn tại

POST /auth/login
        │
        ├── lưu access_token
        ├── lưu user hoặc gọi GET /users/me
        └── gắn Bearer token cho request sau
```

### 13.2 Mua hàng trực tiếp

```text
GET /products
      │
      ├── chọn sản phẩm và quantity
      │
POST /orders
      │
      ├── backend đọc lại giá
      ├── backend kiểm tra/trừ stock
      ├── backend tạo order/history
      └── frontend hiển thị orderCode
```

### 13.3 Mua hàng từ cart

```text
POST /cart/items
GET /cart
PATCH /cart/items/:id
      │
      └── chuyển cart items thành:
          [{ productId, quantity }]
                    │
              POST /orders
```

Backend không tự đọc cart khi tạo order và không tự clear cart sau khi order thành công.

### 13.4 Customer theo dõi/hủy order

```text
GET /orders?page=1&limit=20
GET /orders/:id
GET /orders/:id/status-history

Nếu status === PENDING:
POST /orders/:id/cancel
```

### 13.5 Admin xử lý order

```text
GET /orders
      │
PATCH /orders/:id/status { status: "CONFIRMED" }
      │
PATCH /orders/:id/status { status: "SHIPPING" }
      │
PATCH /orders/:id/status { status: "COMPLETED" }
```

UI chỉ nên hiển thị action hợp lệ theo state machine.

### 13.6 Return/exchange

```text
Order COMPLETED
      │
      ├── trong 168 giờ
      │
POST /return-requests
      │
Admin APPROVED hoặc REJECTED
      │
Nếu APPROVED
      │
Admin COMPLETED
```

Việc vận chuyển hàng trả, refund hoặc tạo sản phẩm đổi phải được xử lý ở workflow khác vì backend hiện chưa tự động hóa các bước này.

### 13.7 Xử lý lỗi frontend

```ts
function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Đã xảy ra lỗi không xác định';
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  return message ?? 'Không thể kết nối tới máy chủ';
}
```

---

## 14. Các điểm frontend hiện tại cần sửa

Các mismatch dưới đây đã được quan sát trong frontend hiện tại.

### 14.1 Admin login đang gọi sai endpoint

Sai:

```http
POST /auth/login
```

Đúng:

```http
POST /admin/auth/login
```

`/auth/login` từ chối tài khoản `ADMIN`.

### 14.2 Product edit đang dùng sai HTTP method

Sai:

```http
PUT /products/:id
```

Đúng:

```http
PATCH /products/:id
```

### 14.3 Product delete phải có admin token

```ts
await api.delete(`/products/${id}`);
```

Axios interceptor phải thêm:

```http
Authorization: Bearer <admin_token>
```

### 14.4 Admin orders phải đọc pagination wrapper

Sai:

```ts
const orders = Array.isArray(response.data) ? response.data : [];
```

Đúng:

```ts
const orders = response.data.items;
```

### 14.5 Không dùng trạng thái `DELIVERED`

Sai:

```ts
status: 'DELIVERED'
```

Đúng:

```ts
status: 'COMPLETED'
```

### 14.6 Checkout không gửi price trong items

Sai:

```json
{
  "productId": 1,
  "quantity": 1,
  "price": 27990000
}
```

Đúng:

```json
{
  "productId": 1,
  "quantity": 1
}
```

Backend kiểm soát giá và từ chối field `price`.

---

## 15. Danh sách toàn bộ endpoint

Backend hiện expose **36 endpoint runtime**.

| # | Method | Path | Access |
|---:|---|---|---|
| 1 | `POST` | `/auth/register` | Public |
| 2 | `POST` | `/auth/login` | Public, USER account |
| 3 | `POST` | `/admin/auth/login` | Public, ADMIN account |
| 4 | `GET` | `/users/me` | User/Admin |
| 5 | `PATCH` | `/users/me` | User/Admin |
| 6 | `GET` | `/users` | Admin |
| 7 | `GET` | `/products` | Public |
| 8 | `GET` | `/products/:id` | Public |
| 9 | `POST` | `/products` | Admin |
| 10 | `PATCH` | `/products/:id` | Admin |
| 11 | `DELETE` | `/products/:id` | Admin |
| 12 | `GET` | `/categories` | Public |
| 13 | `POST` | `/categories` | Admin |
| 14 | `PATCH` | `/categories/:id` | Admin |
| 15 | `DELETE` | `/categories/:id` | Admin |
| 16 | `GET` | `/brands` | Public |
| 17 | `POST` | `/brands` | Admin |
| 18 | `PATCH` | `/brands/:id` | Admin |
| 19 | `DELETE` | `/brands/:id` | Admin |
| 20 | `GET` | `/cart` | User/Admin |
| 21 | `POST` | `/cart/items` | User/Admin |
| 22 | `PATCH` | `/cart/items/:id` | User/Admin |
| 23 | `DELETE` | `/cart/items/:id` | User/Admin |
| 24 | `POST` | `/orders` | User/Admin |
| 25 | `GET` | `/orders` | User/Admin |
| 26 | `POST` | `/orders/:id/cancel` | Owner |
| 27 | `GET` | `/orders/:id/status-history` | Owner/Admin |
| 28 | `GET` | `/orders/:id` | Owner/Admin |
| 29 | `PATCH` | `/orders/:id/status` | Admin |
| 30 | `POST` | `/return-requests` | Order owner |
| 31 | `GET` | `/return-requests` | Current user |
| 32 | `GET` | `/return-requests/:id` | Request owner |
| 33 | `GET` | `/admin/return-requests` | Admin |
| 34 | `GET` | `/admin/return-requests/:id` | Admin |
| 35 | `PATCH` | `/admin/return-requests/:id/status` | Admin |
| 36 | `GET` | `/admin/dashboard` | Admin |

`GET /` được khai báo trong `AppController` nhưng controller này hiện không được đăng ký trong `AppModule`, vì vậy không được tính là endpoint runtime.
