import { ReturnRequestType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, Length, Min } from 'class-validator';

export class CreateReturnRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orderId!: number;

  @IsEnum(ReturnRequestType)
  type!: ReturnRequestType;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(10, 1000)
  reason!: string;
}
