import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CategoriesModule } from "./categories/categories.module";
import { BrandsModule } from "./brands/brands.module";
import { ProductsModule } from "./products/products.module";
import { CartModule } from "./cart/cart.module";
import { OrdersModule } from "./orders/orders.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    AdminModule,
  ],
})
export class AppModule {}
