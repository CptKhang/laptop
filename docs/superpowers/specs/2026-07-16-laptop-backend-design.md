# Laptop Shop Backend Design Spec

**Date:** 2026-07-16  
**Project:** laptop (TechBlue Laptop Shop)  
**Topic:** Full NestJS + MySQL backend to support the existing React frontend  
**Status:** Pending implementation plan

---

## 1. Goal

Design and build a backend service that powers the existing TechBlue Laptop frontend. The backend must provide REST APIs for product browsing, shopping cart, checkout, order tracking, user authentication, and admin management. The database will run on MySQL 8 and be accessed via Prisma ORM inside a NestJS application.

---

## 2. Scope Assumptions

The following assumptions are based on the original request to “add all APIs needed into backend folder” and “run well with frontend”:

- **Backend-first:** implement the backend and expose API contracts; frontend wiring is a follow-up step unless requested otherwise.
- **Customer + Admin APIs:** both the public/customer-facing endpoints and the admin management endpoints (products, orders, users) are included.
- **Database:** MySQL 8 instead of the current PostgreSQL setup.
- **Payments:** store the selected payment method (COD or MoMo) but do not integrate a real payment gateway in this design.
- **Cart:** authenticated-user cart only; guest cart is out of scope.
- **Images:** product images are stored as external URLs; file upload is out of scope for this design.

---

## 3. Business Requirements Derived from Frontend

### 3.1 Product Catalog
- List products with pagination.
- Search products by name.
- Filter by brand, CPU, RAM, and price range.
- Sort by price ascending, price descending, or newest.
- View product detail including specs (CPU, RAM, storage, screen, GPU, warranty, description).

### 3.2 Shopping Cart
- Add a product to the cart.
- View the cart with item details and totals.
- Update item quantity.
- Remove an item from the cart.
- Calculate subtotal, shipping, discount, and total.

### 3.3 Checkout & Orders
- Place an order with shipping information (receiver name, phone, address, note).
- Select a payment method (COD or MoMo).
- Generate an order code after successful placement.
- Track order status (PENDING → CONFIRMED → SHIPPING → COMPLETED / CANCELLED).
- View order history for the authenticated user.

### 3.4 Authentication & Authorization
- Register a new customer account.
- Login and receive a JWT access token.
- Role-based access control: `USER` and `ADMIN`.
- Admins can manage products, orders, and users; customers can only access their own data.

### 3.5 Admin Management
- Admin login.
- Dashboard statistics: total products, today’s orders, revenue.
- CRUD operations for categories, brands, and products.
- View all orders and update order status.
- View all users.

### 3.6 Layout / Static Helpers
- Header search.
- Brand list and category list metadata.

---

## 4. Architecture

### 4.1 High-Level Design
- A single **NestJS monolith** using a layered architecture.
- **Controllers** handle HTTP requests/responses and DTO validation.
- **Services** contain business logic and orchestrate Prisma calls.
- **Prisma Client** is the data access layer.
- **Shared modules:** `PrismaModule` (global), `JwtAuthGuard`, `RolesGuard`, and a `@Roles()` decorator.
- **Infra:** MySQL 8 container via Docker Compose; environment variables for `DATABASE_URL` and `JWT_SECRET`.

### 4.2 Module Breakdown

| Module | Responsibility |
| --- | --- |
| `AuthModule` | Register, login, JWT token issuance, password hashing. |
| `UsersModule` | Get/update profile; list users for admin. |
| `CategoriesModule` | Public list; admin CRUD. |
| `BrandsModule` | Public list; admin CRUD. |
| `ProductsModule` | Public list/detail/search/filter; admin CRUD. |
| `CartModule` | Get cart, add item, update quantity, remove item. |
| `OrdersModule` | Place order, list user orders, order detail, admin update status. |

---

## 5. Database Schema (MySQL + Prisma)

### 5.1 Provider Configuration

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPING
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  COD
  MOMO
}
```

### 5.2 Models

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  fullName  String
  phone     String?
  address   String?
  role      Role     @default(USER)
  carts     Cart[]
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@map("users")
}

model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  products Product[]

  @@map("categories")
}

model Brand {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  products Product[]

  @@map("brands")
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String   @db.Text
  price       Decimal  @db.Decimal(19, 4)
  stock       Int      @default(0)
  image       String
  cpu         String?
  ram         String?
  storage     String?
  screen      String?
  gpu         String?
  warranty    String?
  categoryId  Int
  brandId     Int
  category    Category @relation(fields: [categoryId], references: [id])
  brand       Brand    @relation(fields: [brandId], references: [id])
  cartItems   CartItem[]
  orderItems  OrderItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
  @@index([brandId])
  @@index([price])
  @@index([name])
  @@map("products")
}

model Cart {
  id        Int        @id @default(autoincrement())
  userId    Int        @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([userId])
  @@map("carts")
}

model CartItem {
  id        Int     @id @default(autoincrement())
  cartId    Int
  productId Int
  quantity  Int
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([cartId, productId])
  @@index([productId])
  @@map("cart_items")
}

model Order {
  id            Int           @id @default(autoincrement())
  userId        Int
  receiverName  String
  phone         String
  address       String
  note          String?
  total         Decimal       @db.Decimal(19, 4)
  status        OrderStatus   @default(PENDING)
  paymentMethod PaymentMethod @default(COD)
  user          User          @relation(fields: [userId], references: [id])
  items         OrderItem[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([userId])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  productId Int
  quantity  Int
  price     Decimal @db.Decimal(19, 4) // snapshot price at order time
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])

  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}
```

### 5.3 Key Schema Decisions
- Switched from `Float` to `Decimal` for all money fields to avoid floating-point rounding errors.
- Added `cpu`, `ram`, `storage`, `screen`, `gpu`, and `warranty` fields to `Product` to match the frontend product detail page.
- Enforced one cart per user via `Cart.userId @unique`.
- Added `PaymentMethod` enum to capture the checkout selection.
- Added `@@map` annotations for snake_case table names.


---

## 6. API Surface

### 6.1 Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register a customer account. |
| POST | `/auth/login` | Public | Login and receive JWT. |

### 6.2 Users

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/users/me` | User/Admin | Get current user profile. |
| PATCH | `/users/me` | User/Admin | Update own profile. |
| GET | `/users` | Admin | List all users. |

### 6.3 Categories

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/categories` | Public | List all categories. |
| POST | `/categories` | Admin | Create category. |
| PATCH | `/categories/:id` | Admin | Update category. |
| DELETE | `/categories/:id` | Admin | Delete category. |

### 6.4 Brands

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/brands` | Public | List all brands. |
| POST | `/brands` | Admin | Create brand. |
| PATCH | `/brands/:id` | Admin | Update brand. |
| DELETE | `/brands/:id` | Admin | Delete brand. |

### 6.5 Products

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/products` | Public | List/search/filter products. |
| GET | `/products/:id` | Public | Get product detail. |
| POST | `/products` | Admin | Create product. |
| PATCH | `/products/:id` | Admin | Update product. |
| DELETE | `/products/:id` | Admin | Delete product. |

**Query params for `GET /products`:**
- `search` (string): free-text search on `name`.
- `categoryId` (int): filter by category.
- `brandId` (int): filter by brand.
- `cpu` (string): filter by CPU (e.g., `Intel Core i5`).
- `ram` (string): filter by RAM (e.g., `8GB`).
- `minPrice` / `maxPrice` (int): price range in VND.
- `sort` (string): `price_asc`, `price_desc`, `newest`.
- `page` (int, default 1): pagination page.
- `limit` (int, default 12): items per page.

### 6.6 Cart

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/cart` | User | Get current user’s cart. |
| POST | `/cart/items` | User | Add/update item in cart. |
| PATCH | `/cart/items/:id` | User | Update cart item quantity. |
| DELETE | `/cart/items/:id` | User | Remove cart item. |

### 6.7 Orders

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/orders` | User | Place an order from cart. |
| GET | `/orders` | User | List own orders. |
| GET | `/orders/:id` | User | Get own order detail. |
| GET | `/orders` | Admin | List all orders. |
| PATCH | `/orders/:id/status` | Admin | Update order status. |


---

## 7. Authentication & Authorization

- **JWT access tokens**, 7-day expiry, signed with `JWT_SECRET`.
- **Passwords hashed** with `bcrypt` (cost factor 10).
- **`JwtAuthGuard`** validates the `Authorization: Bearer <token>` header and attaches `req.user`.
- **`RolesGuard`** checks the `role` claim on `req.user` against required roles.
- **`@Roles(Role.ADMIN)`** decorator marks admin-only routes.
- Customers can only access `Cart` and `Order` records belonging to `req.user.id`.

---

## 8. Data Flow Examples

### 8.1 Add to Cart
1. Client sends `POST /cart/items` with `{ productId, quantity }`.
2. `CartService` finds or creates the user’s `Cart`.
3. Validates `quantity > 0` and product existence/stock.
4. Upserts `CartItem`: increments quantity if product already exists, otherwise creates new item.

### 8.2 Checkout
1. Client sends `POST /orders` with `{ receiverName, phone, address, note?, paymentMethod }`.
2. `OrdersService` loads the user’s cart with items and products.
3. Validates each item against current stock and price.
4. Calculates `total` from cart items.
5. Creates `Order` + `OrderItem` records with snapshot prices.
6. Decrements product stock for each item.
7. Deletes the cart items (or the whole cart).
8. Returns the order with a generated order code (e.g., `TB` + `order.id`).

### 8.3 Admin Update Order Status
1. Admin sends `PATCH /orders/:id/status` with `{ status }`.
2. `OrdersService` validates the status transition is allowed.
3. Updates the order status and returns the updated order.

---

## 9. Error Handling

- Global exception filter returns a consistent JSON shape: `{ statusCode, message, error }`.
- `ValidationPipe` is enabled globally with `whitelist: true`, `transform: true`, and `forbidNonWhitelisted: true`.
- Common exceptions:
  - `400 BadRequestException` — invalid input, validation errors, insufficient stock, invalid status transition.
  - `401 UnauthorizedException` — missing or invalid JWT.
  - `403 ForbiddenException` — role not allowed or accessing another user’s data.
  - `404 NotFoundException` — resource not found.

---

## 10. Testing Strategy

- **Unit tests:** mock Prisma service in `*Service` tests to verify business logic (stock checks, total calculation, cart clearing).
- **Controller tests:** verify route wiring, guards, and DTO validation.
- **E2E tests:** cover the happy path for registration → login → add to cart → place order → admin updates status.
- **Database:** use a separate MySQL test database or in-memory SQLite for unit tests; integration tests use the Docker MySQL container.

---

## 11. Deployment & Environment

- **Docker Compose:** update `docker-compose.yml` to use MySQL 8 instead of PostgreSQL.
- **Environment variables:**
  - `DATABASE_URL=mysql://user:password@localhost:3306/laptop_shop`
  - `JWT_SECRET=your-secret-key`
  - `PORT=3000`
- **Migration workflow:** `npx prisma migrate dev` after schema changes; `npx prisma generate` before running the app.

---

## 12. Out of Scope

- Real payment gateway integration (MoMo, VNPay, etc.).
- Product image file upload (images remain external URLs).
- Guest cart / anonymous checkout.
- Email/SMS notifications.
- Product reviews and ratings.
- Inventory audit logs.

---

## 13. Assumptions to Validate

1. Is the scope “customer + admin APIs, backend-only first” correct?
2. Should the frontend be wired to these APIs in the same implementation phase?
3. Is COD + MoMo-as-recorded-payment-method acceptable, or is a real MoMo integration required?
4. Should product images support file upload instead of external URLs?
5. Is an authenticated-user-only cart acceptable, or is a guest cart needed?


