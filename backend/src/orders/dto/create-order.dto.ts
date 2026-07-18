import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { PaymentMethod } from "@prisma/client";

// Định nghĩa cấu trúc cho từng item
class OrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  price: number;
}

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

  // Trường này cực kỳ quan trọng, đã khớp với Frontend gửi lên
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}