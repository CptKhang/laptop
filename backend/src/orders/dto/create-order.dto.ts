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
