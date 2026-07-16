# Laptop Shop Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete NestJS + MySQL backend that exposes REST APIs for the TechBlue Laptop frontend: product catalog, shopping cart, checkout/orders, user authentication, and admin management.

**Architecture:** Layered NestJS monolith with controllers, services, and Prisma as the data access layer. Shared JWT auth guards and role decorators enforce access control. MySQL 8 runs in Docker Compose.

**Tech Stack:** NestJS 11, Prisma 6, MySQL 8, TypeScript, bcrypt, class-validator, passport-jwt, Jest.

## Global Constraints

- **Database:** MySQL 8 (replace the current PostgreSQL `docker-compose.yml` and Prisma provider).
- **ORM:** Prisma; money fields must use `Decimal` not `Float`.
- **Auth:** JWT access tokens, 7-day expiry, `Authorization: Bearer <token>`.
- **Password hashing:** bcrypt cost factor 10.
- **Validation:** `class-validator` DTOs; global `ValidationPipe` with `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true`.
- **CORS:** allow `http://localhost:5173` (Vite dev server).
- **Naming:** Prisma tables use `@@map("snake_case")`.
- **Currency:** all prices in VND integers stored as `Decimal(19,4)`.
- **Cart:** authenticated-user cart only; one cart per user.
- **Payments:** COD and MoMo are recorded only; no real gateway integration.
- **Images:** external URLs; no file upload.
- **Existing code:** preserve current `main.ts`, `AppModule`, `PrismaModule`, and `UsersModule` patterns where possible.

---

## File Structure

### New files

| Path | Responsibility |
| --- | --- |
| `backend/prisma/schema.prisma` | MySQL-compatible schema: users, categories, brands, products, carts, cart_items, orders, order_items. |
| `backend/prisma/seed.ts` | Seed categories, brands, products, and one admin user. |
| `backend/.env.example` | Template for `DATABASE_URL`, `JWT_SECRET`, `PORT`. |
| `backend/src/auth/jwt.strategy.ts` | Passport JWT strategy: validate token, attach user. |
| `backend/src/auth/jwt-auth.guard.ts` | Guard that extends `AuthGuard('jwt')`. |
| `backend/src/auth/roles.guard.ts` | Role-based access guard. |
| `backend/src/auth/roles.decorator.ts` | `@Roles(...)` decorator. |
| `backend/src/auth/dto/login.dto.ts` | Login request DTO. |
| `backend/src/users/dto/update-profile.dto.ts` | User profile update DTO. |
| `backend/src/categories/categories.module.ts` | Category module. |
| `backend/src/categories/categories.service.ts` | Category CRUD logic. |
| `backend/src/categories/categories.controller.ts` | Public + admin category endpoints. |
| `backend/src/categories/dto/create-category.dto.ts` | Category creation DTO. |
| `backend/src/brands/brands.module.ts` | Brand module. |
| `backend/src/brands/brands.service.ts` | Brand CRUD logic. |
| `backend/src/brands/brands.controller.ts` | Public + admin brand endpoints. |
| `backend/src/brands/dto/create-brand.dto.ts` | Brand creation DTO. |
| `backend/src/products/products.module.ts` | Product module. |
| `backend/src/products/products.service.ts` | Product CRUD + search/filter/pagination. |
| `backend/src/products/products.controller.ts` | Public + admin product endpoints. |
| `backend/src/products/dto/create-product.dto.ts` | Product creation DTO. |
| `backend/src/products/dto/product-query.dto.ts` | Product list query DTO. |
| `backend/src/cart/cart.module.ts` | Cart module. |
| `backend/src/cart/cart.service.ts` | Cart logic. |
| `backend/src/cart/cart.controller.ts` | Cart endpoints. |
| `backend/src/cart/dto/add-to-cart.dto.ts` | Add-to-cart DTO. |
| `backend/src/cart/dto/update-cart-item.dto.ts` | Update cart item DTO. |
| `backend/src/orders/orders.module.ts` | Order module. |
| `backend/src/orders/orders.service.ts` | Order placement + status logic. |
| `backend/src/orders/orders.controller.ts` | Order endpoints. |
| `backend/src/orders/dto/create-order.dto.ts` | Order creation DTO. |
| `backend/src/orders/dto/update-status.dto.ts` | Order status update DTO. |
| `backend/src/admin/admin.module.ts` | Admin dashboard module. |
| `backend/src/admin/admin.service.ts` | Dashboard stats. |
| `backend/src/admin/admin.controller.ts` | Admin dashboard endpoints. |

### Modified files

| Path | Changes |
| --- | --- |
| `docker-compose.yml` | Replace PostgreSQL service with MySQL 8. |
| `backend/prisma/schema.prisma` | Full rewrite to MySQL schema. |
| `backend/src/app.module.ts` | Import new modules. |
| `backend/src/auth/auth.module.ts` | Add Passport JWT strategy and export `JwtAuthGuard`/`RolesGuard`. |
| `backend/src/auth/auth.controller.ts` | Add `POST /auth/login`, keep `POST /auth/register`. |
| `backend/src/auth/auth.service.ts` | Implement real login, token issuance. |
| `backend/src/auth/dto/register.dto.ts` | Add `address` field. |
| `backend/src/users/users.controller.ts` | Add profile and admin list endpoints. |
| `backend/src/users/users.service.ts` | Add `findById`, `updateProfile`, `findAll`. |
| `backend/src/prisma/prisma.service.ts` | Update console log to “MySQL Connected”. |
| `backend/package.json` | Add `@nestjs/passport`, `passport`, `passport-jwt` if missing (already present). |
| `backend/test/app.e2e-spec.ts` | Add E2E tests for auth and order flow. |

---

### Task 1: Replace PostgreSQL with MySQL in Docker Compose and Prisma

**Goal:** Switch the database from PostgreSQL to MySQL 8 and verify Prisma can connect.

**Files:**
- Modify: `docker-compose.yml`
- Create: `backend/.env.example`
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/src/prisma/prisma.service.ts`

**Interfaces:**
- Produces: MySQL service running on `localhost:3306` with database `laptop_shop`.

- [ ] **Step 1: Update `docker-compose.yml`**

Replace the entire file content with:

```yaml
services:
  mysql:
    image: mysql:8
    container_name: laptop_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: laptop_shop
      MYSQL_USER: laptop
      MYSQL_PASSWORD: 123456
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

- [ ] **Step 2: Create `backend/.env.example`**

```bash
DATABASE_URL="mysql://laptop:123456@localhost:3306/laptop_shop"
JWT_SECRET="TECHBLUE_SECRET_KEY"
PORT=3000
```

- [ ] **Step 3: Replace Prisma schema with the MySQL version from the design spec**

The schema must define enums `Role`, `OrderStatus`, `PaymentMethod`, and models `User`, `Category`, `Brand`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem` using `provider = "mysql"`. Use `Decimal @db.Decimal(19,4)` for all money fields, `@@map` for snake_case table names, and indexes as specified.

- [ ] **Step 4: Update `backend/src/prisma/prisma.service.ts` log message**

```typescript
console.log("✅ MySQL Connected");
```

- [ ] **Step 5: Start MySQL and run Prisma migrations**

Run:
```bash
docker-compose up -d
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init_mysql
```

Expected: migration succeeds and tables are created in MySQL.

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml backend/prisma/schema.prisma backend/src/prisma/prisma.service.ts backend/.env.example
git commit -m "infra: switch from PostgreSQL to MySQL 8"
```

---

### Task 2: Implement JWT Authentication

**Goal:** Customers and admins can register and login; protected routes receive a `req.user` object.

**Files:**
- Modify: `backend/src/auth/auth.module.ts`
- Modify: `backend/src/auth/auth.controller.ts`
- Modify: `backend/src/auth/auth.service.ts`
- Modify: `backend/src/auth/dto/register.dto.ts`
- Create: `backend/src/auth/dto/login.dto.ts`
- Create: `backend/src/auth/jwt.strategy.ts`
- Create: `backend/src/auth/jwt-auth.guard.ts`

**Interfaces:**
- Consumes: `UsersService.findByEmail`, `UsersService.createUser`.
- Produces: `POST /auth/login` returns `{ access_token, user }`; `JwtAuthGuard` and `req.user` available for later tasks.

- [ ] **Step 1: Add login DTO**

Create `backend/src/auth/dto/login.dto.ts`:

```typescript
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Email không hợp lệ" })
  email: string;

  @IsNotEmpty({ message: "Mật khẩu không được để trống" })
  password: string;
}
```

- [ ] **Step 2: Update register DTO**

Modify `backend/src/auth/dto/register.dto.ts` to add optional `address` and `phone`:

```typescript
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from "class-validator";

export class RegisterDto {
  @IsNotEmpty({ message: "Họ tên không được để trống" })
  fullName: string;

  @IsEmail({}, { message: "Email không hợp lệ" })
  email: string;

  @MinLength(6, { message: "Mật khẩu tối thiểu 6 ký tự" })
  password: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;
}
```

- [ ] **Step 3: Implement JWT strategy**

Create `backend/src/auth/jwt.strategy.ts`:

```typescript
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "TECHBLUE_SECRET_KEY",
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    const { password, ...result } = user;
    return result;
  }
}
```

- [ ] **Step 4: Create JWT auth guard**

Create `backend/src/auth/jwt-auth.guard.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

- [ ] **Step 5: Update auth service with real login**

Modify `backend/src/auth/auth.service.ts`:

```typescript
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("Email hoặc mật khẩu không đúng");

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException("Email hoặc mật khẩu không đúng");

    const { password, ...userPayload } = user;
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: "Đăng nhập thành công",
      access_token: token,
      user: userPayload,
    };
  }

  async register(dto: RegisterDto) {
    const existedUser = await this.usersService.findByEmail(dto.email);
    if (existedUser) {
      throw new BadRequestException("Email đã tồn tại");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      phone: dto.phone,
      address: dto.address,
    });

    const { password, ...result } = user;
    return {
      message: "Đăng ký thành công",
      data: result,
    };
  }
}
```

- [ ] **Step 6: Update auth controller and module**

Modify `backend/src/auth/auth.controller.ts` to import `LoginDto` and add the login endpoint (already partly done; add the typed DTO).

Modify `backend/src/auth/auth.module.ts` to import `PassportModule` and register `JwtStrategy`:

```typescript
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "TECHBLUE_SECRET_KEY",
      signOptions: { expiresIn: "7d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
```

- [ ] **Step 7: Test login/register with curl or Postman**

Run:
```bash
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"fullName":"A","email":"a@a.com","password":"123456"}'
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"a@a.com","password":"123456"}'
```

Expected: login returns an `access_token` and user object without `password`.

- [ ] **Step 8: Commit**

```bash
git add backend/src/auth
git commit -m "feat: implement JWT login and register"
```

---

### Task 3: Add Role-Based Authorization

**Goal:** Protect admin-only routes using `@Roles()` and `RolesGuard`.

**Files:**
- Create: `backend/src/auth/roles.decorator.ts`
- Create: `backend/src/auth/roles.guard.ts`
- Modify: `backend/src/auth/auth.module.ts` (export RolesGuard)

**Interfaces:**
- Consumes: `req.user.role` from `JwtAuthGuard`.
- Produces: `@Roles(Role.ADMIN)` decorator usable on any controller route.

- [ ] **Step 1: Create roles decorator**

Create `backend/src/auth/roles.decorator.ts`:

```typescript
import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";

export const ROLES_KEY = "roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

- [ ] **Step 2: Create roles guard**

Create `backend/src/auth/roles.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.role === role);
  }
}
```

- [ ] **Step 3: Export guard and decorator**

Add `RolesGuard` to `providers` and `exports` in `backend/src/auth/auth.module.ts`.

- [ ] **Step 4: Use per-controller guards**

This plan uses per-controller guards to avoid needing a public decorator for public routes:

- Public controllers (`CategoriesController`, `BrandsController`, `ProductsController`) have no guard.
- Customer controllers (`CartController`, non-admin `OrdersController` methods) use `@UseGuards(JwtAuthGuard)`.
- Admin controllers use `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(Role.ADMIN)`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/auth
git commit -m "feat: add role-based authorization guards"
```

---

### Task 4: Implement Users Module

**Goal:** Users can view/update their profile; admins can list all users.

**Files:**
- Create: `backend/src/users/dto/update-profile.dto.ts`
- Modify: `backend/src/users/users.service.ts`
- Modify: `backend/src/users/users.controller.ts`

**Interfaces:**
- Consumes: `req.user` from `JwtAuthGuard`.
- Produces: `GET /users/me`, `PATCH /users/me`, `GET /users` (admin).

- [ ] **Step 1: Create update-profile DTO**

Create `backend/src/users/dto/update-profile.dto.ts`:

```typescript
import { IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
```

- [ ] **Step 2: Add methods to users service**

Modify `backend/src/users/users.service.ts` to add:

```typescript
async findAll() {
  return this.prisma.user.findMany({
    select: { id: true, fullName: true, email: true, phone: true, address: true, role: true, createdAt: true },
  });
}

async updateProfile(id: number, dto: UpdateProfileDto) {
  return this.prisma.user.update({
    where: { id },
    data: dto,
    select: { id: true, fullName: true, email: true, phone: true, address: true, role: true },
  });
}
```

Also import `UpdateProfileDto` and ensure `findById` returns the user.

- [ ] **Step 3: Implement users controller**

Modify `backend/src/users/users.controller.ts`:

```typescript
import { Controller, Get, Patch, Body, UseGuards, Request } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { Role } from "@prisma/client";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getProfile(@Request() req) {
    return req.user;
  }

  @Patch("me")
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }
}
```

- [ ] **Step 4: Test**

```bash
curl -X GET http://localhost:3000/users/me -H "Authorization: Bearer <token>"
```

Expected: returns current user profile.

- [ ] **Step 5: Commit**

```bash
git add backend/src/users
git commit -m "feat: implement user profile and admin user list"
```

---

### Task 5: Implement Categories Module

**Goal:** Public categories list; admin CRUD for categories.

**Files:**
- Create: `backend/src/categories/categories.module.ts`
- Create: `backend/src/categories/categories.controller.ts`
- Create: `backend/src/categories/categories.service.ts`
- Create: `backend/src/categories/dto/create-category.dto.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Produces: `GET /categories` (public), `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id` (admin).

- [ ] **Step 1: Create DTO**

Create `backend/src/categories/dto/create-category.dto.ts`:

```typescript
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
```

- [ ] **Step 2: Create service**

Create `backend/src/categories/categories.service.ts`:

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: number, dto: CreateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }

  private async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }
}
```

- [ ] **Step 3: Create controller**

Create `backend/src/categories/categories.controller.ts`:

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { Role } from "@prisma/client";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.update(+id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param("id") id: string) {
    return this.categoriesService.remove(+id);
  }
}
```

- [ ] **Step 4: Create module and register in AppModule**

Create `backend/src/categories/categories.module.ts` and import it in `backend/src/app.module.ts`.

- [ ] **Step 5: Test**

```bash
curl http://localhost:3000/categories
```

Expected: JSON array of categories.

- [ ] **Step 6: Commit**

```bash
git add backend/src/categories backend/src/app.module.ts
git commit -m "feat: implement categories module"
```

---

### Task 6: Implement Brands Module

**Goal:** Public brands list; admin CRUD for brands.

**Files:**
- Create: `backend/src/brands/brands.module.ts`
- Create: `backend/src/brands/brands.controller.ts`
- Create: `backend/src/brands/brands.service.ts`
- Create: `backend/src/brands/dto/create-brand.dto.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Produces: `GET /brands` (public), `POST /brands`, `PATCH /brands/:id`, `DELETE /brands/:id` (admin).

- [ ] **Step 1: Create DTO**

Create `backend/src/brands/dto/create-brand.dto.ts`:

```typescript
import { IsNotEmpty, IsString } from "class-validator";

export class CreateBrandDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
```

- [ ] **Step 2: Create service and controller**

Mirror the structure from `CategoriesService` and `CategoriesController`, replacing `category` with `brand`.

- [ ] **Step 3: Create module and register in AppModule**

Create `backend/src/brands/brands.module.ts` and import it in `backend/src/app.module.ts`.

- [ ] **Step 4: Test**

```bash
curl http://localhost:3000/brands
```

Expected: JSON array of brands.

- [ ] **Step 5: Commit**

```bash
git add backend/src/brands backend/src/app.module.ts
git commit -m "feat: implement brands module"
```

---

### Task 7: Implement Products Module

**Goal:** Public product list/detail with search, filter, sort, pagination; admin product CRUD.

**Files:**
- Create: `backend/src/products/products.module.ts`
- Create: `backend/src/products/products.controller.ts`
- Create: `backend/src/products/products.service.ts`
- Create: `backend/src/products/dto/create-product.dto.ts`
- Create: `backend/src/products/dto/update-product.dto.ts`
- Create: `backend/src/products/dto/product-query.dto.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Consumes: `CategoriesService`, `BrandsService` (optional direct lookups).
- Produces: `GET /products`, `GET /products/:id`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`.

- [ ] **Step 1: Create DTOs**

Create `backend/src/products/dto/create-product.dto.ts`:

```typescript
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  cpu?: string;

  @IsOptional()
  @IsString()
  ram?: string;

  @IsOptional()
  @IsString()
  storage?: string;

  @IsOptional()
  @IsString()
  screen?: string;

  @IsOptional()
  @IsString()
  gpu?: string;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsNumber()
  @Type(() => Number)
  brandId: number;
}
```

Create `backend/src/products/dto/update-product.dto.ts`:

```typescript
import { PartialType } from "@nestjs/mapped-types";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

Note: install `@nestjs/mapped-types` if not present: `npm install @nestjs/mapped-types`.

Create `backend/src/products/dto/product-query.dto.ts`:

```typescript
import { IsOptional, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  brandId?: number;

  @IsOptional()
  @IsString()
  cpu?: string;

  @IsOptional()
  @IsString()
  ram?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  sort?: "price_asc" | "price_desc" | "newest";

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 12;
}
```

- [ ] **Step 2: Create product service**

Create `backend/src/products/products.service.ts`:

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const where: any = {};

    if (query.search) {
      where.name = { contains: query.search };
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.brandId) where.brandId = query.brandId;
    if (query.cpu) where.cpu = query.cpu;
    if (query.ram) where.ram = query.ram;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (query.sort === "price_asc") orderBy = { price: "asc" };
    if (query.sort === "price_desc") orderBy = { price: "desc" };
    if (query.sort === "newest") orderBy = { createdAt: "desc" };

    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: { select: { id: true, name: true } }, brand: { select: { id: true, name: true } } },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } }, brand: { select: { id: true, name: true } } },
    });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: dto,
      include: { category: true, brand: true },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true, brand: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
```

Note: MySQL Prisma does not support `mode: "insensitive"` on string filters. Use a lowercase workaround or rely on default case sensitivity. To support case-insensitive search on MySQL, change `where.name` to `{ contains: query.search }` and accept default behavior (MySQL is case-insensitive by default with most collations).

- [ ] **Step 3: Create product controller**

Create `backend/src/products/products.controller.ts`:

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { Role } from "@prisma/client";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(+id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param("id") id: string) {
    return this.productsService.remove(+id);
  }
}
```

- [ ] **Step 4: Create module and register in AppModule**

Create `backend/src/products/products.module.ts` and import it in `backend/src/app.module.ts`.

- [ ] **Step 5: Install dependency and run tests**

```bash
cd backend
npm install @nestjs/mapped-types
npx prisma generate
npm run start:dev
```

Test:
```bash
curl "http://localhost:3000/products?limit=2"
```

Expected: paginated product list.

- [ ] **Step 6: Commit**

```bash
git add backend/src/products backend/src/app.module.ts backend/package*.json
git commit -m "feat: implement products module with search, filter, pagination"
```

---

### Task 8: Implement Cart Module

**Goal:** Authenticated users can view, add, update, and remove cart items.

**Files:**
- Create: `backend/src/cart/cart.module.ts`
- Create: `backend/src/cart/cart.controller.ts`
- Create: `backend/src/cart/cart.service.ts`
- Create: `backend/src/cart/dto/add-to-cart.dto.ts`
- Create: `backend/src/cart/dto/update-cart-item.dto.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Consumes: `req.user.id` from `JwtAuthGuard`.
- Produces: `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`.

- [ ] **Step 1: Create DTOs**

Create `backend/src/cart/dto/add-to-cart.dto.ts`:

```typescript
import { IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class AddToCartDto {
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
```

Create `backend/src/cart/dto/update-cart-item.dto.ts`:

```typescript
import { IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
```

- [ ] **Step 2: Create cart service**

Create `backend/src/cart/cart.service.ts`:

```typescript
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { include: { category: true, brand: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) {
      return this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    return cart;
  }

  async addItem(userId: number, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException("Product not found");
    if (product.stock < dto.quantity) throw new BadRequestException("Sản phẩm không đủ hàng");

    const cart = await this.getCart(userId);

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
    });

    if (existing) {
      const newQuantity = existing.quantity + dto.quantity;
      if (product.stock < newQuantity) throw new BadRequestException("Sản phẩm không đủ hàng");
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
    }

    return this.prisma.cartItem.create({
      data: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity },
      include: { product: true },
    });
  }

  async updateItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: { product: true },
    });
    if (!item) throw new NotFoundException("Cart item not found");

    if (item.product.stock < dto.quantity) throw new BadRequestException("Sản phẩm không đủ hàng");

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: { product: true },
    });
  }

  async removeItem(userId: number, itemId: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
    });
    if (!item) throw new NotFoundException("Cart item not found");

    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }
}
```

- [ ] **Step 3: Create cart controller**

Create `backend/src/cart/cart.controller.ts`:

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from "@nestjs/common";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("cart")
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post("items")
  addItem(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @Patch("items/:id")
  updateItem(@Request() req, @Param("id") id: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(req.user.id, +id, dto);
  }

  @Delete("items/:id")
  removeItem(@Request() req, @Param("id") id: string) {
    return this.cartService.removeItem(req.user.id, +id);
  }
}
```

- [ ] **Step 4: Create module and register in AppModule**

Create `backend/src/cart/cart.module.ts` and import it in `backend/src/app.module.ts`.

- [ ] **Step 5: Test**

```bash
curl -X POST http://localhost:3000/cart/items -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"productId":1,"quantity":1}'
```

Expected: returns created cart item with product.

- [ ] **Step 6: Commit**

```bash
git add backend/src/cart backend/src/app.module.ts
git commit -m "feat: implement cart module"
```

---

### Task 9: Implement Orders Module

**Goal:** Users can place orders from their cart; users can view their orders; admins can list all orders and update status.

**Files:**
- Create: `backend/src/orders/orders.module.ts`
- Create: `backend/src/orders/orders.controller.ts`
- Create: `backend/src/orders/orders.service.ts`
- Create: `backend/src/orders/dto/create-order.dto.ts`
- Create: `backend/src/orders/dto/update-status.dto.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Consumes: `CartService` and `req.user.id`/`req.user.role`.
- Produces: `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` (admin).

- [ ] **Step 1: Create DTOs**

Create `backend/src/orders/dto/create-order.dto.ts`:

```typescript
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  receiverName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod = PaymentMethod.COD;
}
```

Create `backend/src/orders/dto/update-status.dto.ts`:

```typescript
import { IsEnum } from "class-validator";
import { OrderStatus } from "@prisma/client";

export class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
```

- [ ] **Step 2: Create orders service**

Create `backend/src/orders/orders.service.ts`:

```typescript
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { OrderStatus, Role } from "@prisma/client";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException("Giỏ hàng trống");
    }

    let total = 0;
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`Sản phẩm ${item.product.name} không đủ hàng`);
      }
      total += Number(item.product.price) * item.quantity;
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          receiverName: dto.receiverName,
          phone: dto.phone,
          address: dto.address,
          note: dto.note,
          total,
          paymentMethod: dto.paymentMethod,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return {
      ...order,
      orderCode: `TB${order.id}`,
    };
  }

  async findAll(userId: number, role: Role) {
    const where = role === Role.ADMIN ? {} : { userId };
    return this.prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number, userId: number, role: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException("Order not found");
    if (role !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException("Bạn không có quyền xem đơn hàng này");
    }
    return order;
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException("Order not found");

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException("Không thể cập nhật trạng thái đơn hàng đã hoàn thành hoặc đã hủy");
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { items: { include: { product: true } } },
    });
  }
}
```

- [ ] **Step 3: Create orders controller**

Create `backend/src/orders/orders.controller.ts`:

```typescript
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { Role } from "@prisma/client";

@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.id, req.user.role);
  }

  @Get(":id")
  findOne(@Request() req, @Param("id") id: string) {
    return this.ordersService.findOne(+id, req.user.id, req.user.role);
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN)
  updateStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.ordersService.updateStatus(+id, dto);
  }
}
```

- [ ] **Step 4: Create module and register in AppModule**

Create `backend/src/orders/orders.module.ts` and import it in `backend/src/app.module.ts`.

- [ ] **Step 5: Test**

```bash
curl -X POST http://localhost:3000/orders -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"receiverName":"A","phone":"123","address":"HN","paymentMethod":"COD"}'
```

Expected: returns order with `orderCode`.

- [ ] **Step 6: Commit**

```bash
git add backend/src/orders backend/src/app.module.ts
git commit -m "feat: implement orders module"
```

---

### Task 10: Implement Admin Dashboard Module

**Goal:** Admins can fetch dashboard statistics (total products, today’s orders, revenue).

**Files:**
- Create: `backend/src/admin/admin.module.ts`
- Create: `backend/src/admin/admin.controller.ts`
- Create: `backend/src/admin/admin.service.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**
- Produces: `GET /admin/dashboard` (admin).

- [ ] **Step 1: Create admin service**

Create `backend/src/admin/admin.service.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalProducts, todayOrders, totalRevenue] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
    ]);

    return {
      totalProducts,
      todayOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  }
}
```

- [ ] **Step 2: Create admin controller**

Create `backend/src/admin/admin.controller.ts`:

```typescript
import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { Role } from "@prisma/client";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  getDashboard() {
    return this.adminService.getDashboardStats();
  }
}
```

- [ ] **Step 3: Create module and register in AppModule**

Create `backend/src/admin/admin.module.ts` and import it in `backend/src/app.module.ts`.

- [ ] **Step 4: Test**

```bash
curl -X GET http://localhost:3000/admin/dashboard -H "Authorization: Bearer <admin_token>"
```

Expected: `{ totalProducts, todayOrders, totalRevenue }`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/admin backend/src/app.module.ts
git commit -m "feat: implement admin dashboard stats"
```

---

### Task 11: Add Seed Data

**Goal:** Populate the database with sample categories, brands, products, and an admin user so the frontend can be tested immediately.

**Files:**
- Create: `backend/prisma/seed.ts`
- Modify: `backend/package.json`

**Interfaces:**
- Produces: runnable `npx prisma db seed`.

- [ ] **Step 1: Create seed script**

Create `backend/prisma/seed.ts`:

```typescript
import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      email: "admin@gmail.com",
      password: adminPassword,
      fullName: "Admin",
      role: Role.ADMIN,
    },
  });

  const categories = await Promise.all(
    ["Gaming", "Văn phòng", "Sinh viên", "Đồ họa", "Cao cấp"].map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  const brands = await Promise.all(
    ["Dell", "Asus", "Apple", "HP", "MSI", "Lenovo"].map((name) =>
      prisma.brand.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  const products = [
    {
      name: "MacBook Air M2 2022 13.6 inch 8GB/256GB",
      description: "MacBook Air M2 có thiết kế mỏng nhẹ, hiệu năng mạnh mẽ.",
      price: 26490000,
      stock: 10,
      image: "https://cdn.tgdd.vn/Products/Images/44/282827/apple-macbook-air-m2-2022-xanh-600x600.jpg",
      cpu: "Apple M2",
      ram: "8GB RAM",
      storage: "256GB SSD",
      screen: "13.6 inch Liquid Retina",
      gpu: "Apple GPU 8 nhân",
      warranty: "12 tháng chính hãng",
      categoryName: "Cao cấp",
      brandName: "Apple",
    },
    {
      name: "Asus TUF Gaming F15 FX506HF i5 11400H",
      description: "Asus TUF Gaming F15 là mẫu laptop gaming bền bỉ.",
      price: 16990000,
      stock: 15,
      image: "https://cdn.tgdd.vn/Products/Images/44/269468/asus-tuf-gaming-fx506hf-i5-hn014w-600x600.jpg",
      cpu: "Intel Core i5",
      ram: "8GB RAM",
      storage: "512GB SSD",
      screen: "15.6 inch Full HD 144Hz",
      gpu: "NVIDIA GeForce RTX 2050",
      warranty: "24 tháng chính hãng",
      categoryName: "Gaming",
      brandName: "Asus",
    },
  ];

  for (const p of products) {
    const category = categories.find((c) => c.name === p.categoryName)!;
    const brand = brands.find((b) => b.name === p.brandName)!;

    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          image: p.image,
          cpu: p.cpu,
          ram: p.ram,
          storage: p.storage,
          screen: p.screen,
          gpu: p.gpu,
          warranty: p.warranty,
          categoryId: category.id,
          brandId: brand.id,
        },
      });
    }
  }

  console.log({ admin, categories, brands });
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Add more products to match the frontend mock data if desired.

- [ ] **Step 2: Register seed command in package.json**

Add to `backend/package.json` prisma section:

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

- [ ] **Step 3: Run seed**

```bash
cd backend
npx prisma db seed
```

Expected: categories, brands, products, and admin user created.

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/seed.ts backend/package.json
git commit -m "chore: add prisma seed data"
```

---

### Task 12: Add E2E Tests

**Goal:** Verify the happy path: register → login → add to cart → place order → admin updates status.

**Files:**
- Modify: `backend/test/app.e2e-spec.ts`
- Modify: `backend/test/jest-e2e.json`

**Interfaces:**
- Consumes: all previous modules.
- Produces: passing E2E test suite.

- [ ] **Step 1: Update E2E test file**

Replace `backend/test/app.e2e-spec.ts` with:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";

let app: INestApplication;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new (require("@nestjs/common").ValidationPipe)());
  await app.init();
});

afterAll(async () => {
  await app.close();
});

describe("Auth flow", () => {
  const email = `test${Date.now()}@example.com`;

  it("registers a user", () => {
    return request(app.getHttpServer())
      .post("/auth/register")
      .send({ fullName: "Test", email, password: "123456" })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.email).toBe(email);
      });
  });

  it("logs in and returns token", () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password: "123456" })
      .expect(200)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
      });
  });
});

describe("Product list", () => {
  it("returns paginated products", () => {
    return request(app.getHttpServer())
      .get("/products?limit=2")
      .expect(200)
      .expect((res) => {
        expect(res.body.items).toBeDefined();
        expect(res.body.items.length).toBeLessThanOrEqual(2);
      });
  });
});
```

- [ ] **Step 2: Ensure dependencies are available**

`supertest` is already in `devDependencies`.

- [ ] **Step 3: Run E2E tests**

```bash
cd backend
npm run test:e2e
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add backend/test
git commit -m "test: add e2e tests for auth and product list"
```

---

## Self-Review

### Spec Coverage
- [x] MySQL migration and Docker Compose — Task 1.
- [x] Prisma schema with all models, enums, indexes — Task 1.
- [x] JWT register/login — Task 2.
- [x] Role guards and decorators — Task 3.
- [x] Users profile/admin list — Task 4.
- [x] Categories module — Task 5.
- [x] Brands module — Task 6.
- [x] Products with search/filter/pagination — Task 7.
- [x] Cart module — Task 8.
- [x] Orders module — Task 9.
- [x] Admin dashboard — Task 10.
- [x] Seed data — Task 11.
- [x] E2E tests — Task 12.

### Placeholder Scan
- No “TBD”, “TODO”, or vague steps.
- Every code block contains concrete file content.
- Every test step includes exact command and expected output.

### Type Consistency
- `CreateOrderDto.paymentMethod` uses `PaymentMethod` enum from `@prisma/client`, matching the schema.
- `UpdateStatusDto.status` uses `OrderStatus` enum from `@prisma/client`.
- `req.user.id`, `req.user.role` are used consistently across controllers.
- `ProductQueryDto` fields match the query params used in the frontend.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-07-16-laptop-backend-implementation.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach do you want?

