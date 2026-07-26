import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  loginCustomer(dto: LoginDto) {
    return this.loginForRole(dto, Role.USER);
  }

  loginAdmin(dto: LoginDto) {
    return this.loginForRole(dto, Role.ADMIN);
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existedUser = await this.usersService.findByEmail(email);
    if (existedUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService
      .createUser({
        fullName: dto.fullName.trim(),
        email,
        password: hashedPassword,
        phone: dto.phone,
        address: dto.address,
        role: Role.USER,
      })
      .catch((error: unknown) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('Email đã tồn tại');
        }
        throw error;
      });

    const { password, ...result } = user;
    void password;
    return {
      message: 'Đăng ký thành công',
      data: result,
    };
  }

  private async loginForRole(dto: LoginDto, expectedRole: Role) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);
    const isMatch = user
      ? await bcrypt.compare(dto.password, user.password)
      : false;

    if (!user || !isMatch || user.role !== expectedRole) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const { password, ...userPayload } = user;
    void password;
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Đăng nhập thành công',
      access_token: token,
      user: userPayload,
    };
  }
}
