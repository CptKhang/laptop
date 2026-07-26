import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 1. Import ConfigModule
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { ReturnRequestsModule } from './return-requests/return-requests.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // 2. Khai báo ConfigModule.forRoot() để đọc file .env
    ConfigModule.forRoot({
      isGlobal: true, // Giúp các biến môi trường có thể dùng ở mọi nơi
      envFilePath: '.env', // Chỉ định đường dẫn tới file .env
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    ReturnRequestsModule,
    AdminModule,
  ],
})
export class AppModule {}
