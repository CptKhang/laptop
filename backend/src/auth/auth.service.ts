import {
    BadRequestException,
    Injectable,
  } from "@nestjs/common";
  import { UsersService } from "../users/users.service";
  import { RegisterDto } from "./dto/register.dto";
  import * as bcrypt from "bcrypt";
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly usersService: UsersService,
    ) {}
  
    async login(body: any) {
        return {
          message: "Login Success",
          data: body,
        };
      }

    async register(dto: RegisterDto) {
      const existedUser = await this.usersService.findByEmail(
        dto.email,
      );
  
      if (existedUser) {
        throw new BadRequestException(
          "Email đã tồn tại",
        );
      }
  
      const hashedPassword = await bcrypt.hash(
        dto.password,
        10,
      );
  
      const user = await this.usersService.createUser({
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        address: dto.address,
      });
  
      // Không trả password về frontend
      const { password, ...result } = user;
  
      return {
        message: "Đăng ký thành công",
        data: result,
      };
    }
  }