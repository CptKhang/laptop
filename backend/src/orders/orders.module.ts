import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
// Có thể bạn đang import PrismaModule hoặc các Module khác ở đây, hãy giữ nguyên chúng

@Module({
  imports: [
    // ... các module cũ của bạn (ví dụ PrismaModule)
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService], // BƯỚC SỐNG CÒN: Phải xuất OrdersService ra ngoài thì PaymentModule mới dùng được!
})
export class OrdersModule {}