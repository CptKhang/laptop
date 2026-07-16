import { IsEmail, IsNotEmpty, MinLength, IsOptional } from "class-validator";

export class RegisterDto {
  @IsNotEmpty({ message: "Họ tên không được để trống" })
  fullName: string;

  @IsEmail({}, { message: "Email không hợp lệ" })
  email: string;

  @MinLength(6, { message: "Mật khẩu tối thiểu 6 ký tự" })
  password: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;
}
