import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrdersModule } from '../orders/orders.module'; // 1. Khai báo đường dẫn đến phân hệ Orders
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    OrdersModule, // 2. Bắt buộc: Cấp quyền cho PaymentModule được phép sử dụng các Service của OrdersModule
    ConfigModule  // Cấp quyền sử dụng ConfigService để đọc biến môi trường
  ],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}