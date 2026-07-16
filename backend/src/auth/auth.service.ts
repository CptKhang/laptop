import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    const { password, ...userPayload } = user;
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: "Đăng nhập thành công",
      access_token: token,
      user: userPayload,
    };
  }

  async register(dto: RegisterDto) {
    const existedUser = await this.usersService.findByEmail(dto.email);
    if (existedUser) {
      throw new BadRequestException("Email đã tồn tại");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      phone: dto.phone,
      address: dto.address,
    });

    const { password, ...result } = user;
    return {
      message: "Đăng ký thành công",
      data: result,
    };
  }
}
