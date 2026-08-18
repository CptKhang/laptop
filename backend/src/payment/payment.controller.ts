import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OrdersService } from '../orders/orders.service'; // BẮT BUỘC IMPORT

@Controller('payment')
export class PaymentController {
  // INJECT THÊM ORDERSSERVICE ĐỂ CHẠM TỚI DATABASE
  constructor(
    private readonly paymentService: PaymentService,
    private readonly ordersService: OrdersService 
  ) {}

  @Post('create-momo')
  @HttpCode(HttpStatus.OK)
  async createMomoPayment(@Body() body: { orderId: string; amount: number }) {
    if (!body.orderId || !body.amount) {
      throw new Error('Dữ liệu yêu cầu thanh toán không hợp lệ');
    }
    
    return await this.paymentService.createMomoTransaction(
      body.orderId,
      body.amount.toString()
    );
  }

  // ===================================================================
  // ENDPOINT NHẬN TÍN HIỆU TỪ TRANG GIẢ LẬP NỘI BỘ (MOCK MOMO)
  // ===================================================================
  @Post('mock-ipn')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handleMockWebhook(@Body() body: { orderId: string; amount: number; resultCode: number; message: string }) {
    console.log('--- MOCK IPN: NHẬN TÍN HIỆU GIẢ LẬP ---', body);
    
    const orderId = parseInt(body.orderId, 10);
    if (isNaN(orderId)) {
      console.error(`⛔ LỖI DỮ LIỆU MOCK: orderId [${body.orderId}] không hợp lệ!`);
      return;
    }

    if (body.resultCode === 0) {
      console.log(`✅ Khách hàng thanh toán giả lập THÀNH CÔNG cho đơn: ${orderId}. Đang cập nhật DB...`);
      await this.ordersService.updatePaymentStatus(orderId, 'PAID');
    } else {
      console.log(`❌ Giao dịch giả lập THẤT BẠI. Code: ${body.resultCode}. Đang cập nhật DB...`);
      await this.ordersService.updatePaymentStatus(orderId, 'FAILED');
    }
  }

  // ===================================================================
  // ENDPOINT GỐC DÀNH CHO WEBHOOK THẬT TỪ MOMO (GIỮ LẠI DÙNG SAU)
  // ===================================================================
  @Post('momo-ipn')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handleMomoWebhook(@Body() momoResponse: any) {
    console.log('--- IPN: NHẬN TÍN HIỆU TỪ SERVER MOMO ---');
    
    // 1. Kiểm tra chữ ký (Lớp khiên chống Hacker)
    const isValid = this.paymentService.verifyMomoIpnSignature(momoResponse);
    
    if (!isValid) {
      console.error('⛔ CẢNH BÁO BẢO MẬT: CHỮ KÝ GIẢ MẠO! TỪ CHỐI XỬ LÝ!');
      return; 
    }

    // 2. CHẶN LỖI KIỂU DỮ LIỆU: Ép chuỗi orderId của MoMo thành Số nguyên cho Prisma
    const orderId = parseInt(momoResponse.orderId, 10);
    if (isNaN(orderId)) {
      console.error(`⛔ LỖI DỮ LIỆU: orderId [${momoResponse.orderId}] không phải là số hợp lệ!`);
      return;
    }

    // 3. Xử lý nghiệp vụ và chọc vào Database
    if (momoResponse.resultCode === 0) {
      console.log(`✅ Khách hàng đã thanh toán thành công cho đơn: ${orderId}. Đang cập nhật DB...`);
      await this.ordersService.updatePaymentStatus(orderId, 'PAID');
    } else {
      console.log(`❌ Giao dịch thất bại. ResultCode: ${momoResponse.resultCode}. Đang cập nhật DB...`);
      await this.ordersService.updatePaymentStatus(orderId, 'FAILED');
    }
  }
}