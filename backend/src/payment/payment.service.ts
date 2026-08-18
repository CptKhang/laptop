import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(private readonly configService: ConfigService) {}

  async createMomoTransaction(orderId: string, amount: string) {
    // ----------------------------------------------------
    // CHẾ ĐỘ MOCK (THANH TOÁN NỘI BỘ): Bỏ qua gọi MoMo thật
    // ----------------------------------------------------
    const isMockMode = false; // Bật cờ giả lập để test nội bộ

    if (isMockMode) {
      console.log(`🛠️ [MOCK PAYMENT] Đang tạo link giả lập cho đơn hàng #${orderId} với số tiền ${amount}đ`);
      const payUrl = `http://localhost:5173/mock-momo?orderId=${orderId}&amount=${amount}`;
      return {
        payUrl,
        resultCode: 0,
        message: "Tạo link giả lập thành công",
      };
    }

    // --- CODE GỐC GỌI MOMO THẬT (ĐÃ ĐƯỢC GIỮ LẠI ĐỂ SỬ DỤNG SAU NÀY) ---
    const partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE');
    const accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MOMO_SECRET_KEY');
    const paymentUrl = this.configService.get<string>('MOMO_PAYMENT_URL');

    if (!partnerCode || !accessKey || !secretKey || !paymentUrl) {
      throw new InternalServerErrorException('Hệ thống thiếu cấu hình MoMo. Vui lòng kiểm tra lại file .env');
    }

    const redirectUrl = this.configService.get<string>('MOMO_REDIRECT_URL'); 
    const ipnUrl = this.configService.get<string>('MOMO_IPN_URL'); 

    if (!redirectUrl || !ipnUrl) {
      throw new InternalServerErrorException('Thiếu cấu hình MOMO_REDIRECT_URL hoặc MOMO_IPN_URL trong file .env');
    }
    
    const requestType = 'payWithMethod';
    const extraData = '';
    const orderInfo = `Thanh toán đơn hàng ${orderId}`;
    const requestId = partnerCode + new Date().getTime() + "req";

    const rawDataObj = {
      accessKey,
      amount,
      extraData,
      ipnUrl,
      orderId,
      orderInfo,
      partnerCode,
      redirectUrl,
      requestId,
      requestType,
    };

    const rawSignature = Object.keys(rawDataObj)
      .sort()
      .map((key) => `${key}=${rawDataObj[key]}`)
      .join('&');
    
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      ...rawDataObj,
      partnerName: "BeeTech",
      storeId: "MomoTestStore",
      lang: 'vi',
      autoCapture: true,
      orderGroupId: '',
      signature,
    };

    try {
      const response = await axios.post(paymentUrl, requestBody);
      return response.data; 
    } catch (error: any) {
      console.error("❌ Lỗi giao tiếp MoMo chi tiết:", error.response?.data || error.message);
      throw new InternalServerErrorException('Khởi tạo thanh toán thất bại. Hệ thống MoMo đang gặp sự cố.');
    }
  }

  // ===================================================================
  // LỚP KHIÊN BẢO MẬT: KIỂM TRA CHỮ KÝ WEBHOOK TỪ MOMO
  // ===================================================================
  verifyMomoIpnSignature(ipnData: any): boolean {
    const accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MOMO_SECRET_KEY');

    if (!accessKey || !secretKey) {
        console.error('Lỗi cấu hình: Không tìm thấy Access Key hoặc Secret Key để kiểm tra chữ ký.');
        return false;
    }

    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = ipnData;

    const ipnObj = {
      accessKey,
      amount,
      extraData,
      message,
      orderId,
      orderInfo,
      orderType,
      partnerCode,
      payType,
      requestId,
      responseTime,
      resultCode,
      transId,
    };

    const rawSignature = Object.keys(ipnObj)
      .sort()
      .map((key) => `${key}=${ipnObj[key]}`)
      .join('&');

    const generatedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    return generatedSignature === signature;
  }
}