import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(private readonly configService: ConfigService) {}

  async createMomoTransaction(orderIdInput: string, amountInput: string | number) {
    // --- SỬ DỤNG BỘ KEY CHUẨN ĐÃ TEST THÀNH CÔNG ---
    const partnerCode = "MOMO";
    const accessKey = "F8BBA842ECF85";
    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const paymentUrl = "https://test-payment.momo.vn/v2/gateway/api/create";

    const redirectUrl = this.configService.get<string>('MOMO_REDIRECT_URL')?.trim().replace(/\r/g, '') || "http://localhost:5173/orderPage"; 
    const ipnUrl = this.configService.get<string>('MOMO_IPN_URL')?.trim().replace(/\r/g, ''); 

    if (!ipnUrl) {
      throw new InternalServerErrorException('Thiếu cấu hình MOMO_IPN_URL trong file .env');
    }
    
    const amountNumber = Number(amountInput);
    if (!amountNumber || amountNumber <= 0) {
      throw new InternalServerErrorException('Số tiền thanh toán không hợp lệ');
    }

    const amount = String(Math.round(amountNumber));
    const orderId = `${orderIdInput}_${Date.now()}`;
    const requestId = orderId;
    const requestType = 'payWithMethod';
    const extraData = '';
    const orderInfo = "pay with MoMo";
    const lang = "vi";
    const autoCapture = true;
    const orderGroupId = "";

    // 1. Ghép chuỗi rawSignature chính xác tuyệt đối theo thứ tự alphabet
    const rawSignature = 
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    // 2. Tạo chữ ký HMAC SHA256
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    // 3. Payload gửi sang MoMo
    const requestBody = {
      partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData,
      orderGroupId,
      signature,
    };

    try {
      console.log("📤 Gửi request sang MoMo với orderId:", orderId);
      const response = await axios.post(paymentUrl, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("📥 MOMO RESULT:", response.data);
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
    const accessKey = "F8BBA842ECF85";
    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

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
      amount: String(amount),
      extraData: extraData || '',
      message: message || '',
      orderId: String(orderId),
      orderInfo: orderInfo || '',
      orderType: orderType || '',
      partnerCode,
      payType: payType || '',
      requestId,
      responseTime: String(responseTime),
      resultCode: String(resultCode),
      transId: String(transId),
    };

    const rawSignature = 
      `accessKey=${ipnObj.accessKey}` +
      `&amount=${ipnObj.amount}` +
      `&extraData=${ipnObj.extraData}` +
      `&message=${ipnObj.message}` +
      `&orderInfo=${ipnObj.orderInfo}` +
      `&orderId=${ipnObj.orderId}` +
      `&orderType=${ipnObj.orderType}` +
      `&partnerCode=${ipnObj.partnerCode}` +
      `&payType=${ipnObj.payType}` +
      `&requestId=${ipnObj.requestId}` +
      `&responseTime=${ipnObj.responseTime}` +
      `&resultCode=${ipnObj.resultCode}` +
      `&transId=${ipnObj.transId}`;

    const generatedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    return generatedSignature === signature;
  }
}