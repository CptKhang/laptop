import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  cpu?: string;

  @IsOptional()
  @IsString()
  ram?: string;

  @IsOptional()
  @IsString()
  storage?: string;

  @IsOptional()
  @IsString()
  screen?: string;

  @IsOptional()
  @IsString()
  gpu?: string;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsNumber()
  @Type(() => Number)
  brandId: number;
}
