import { ReturnRequestStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateReturnRequestStatusDto {
  @IsEnum(ReturnRequestStatus)
  status!: ReturnRequestStatus;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}
