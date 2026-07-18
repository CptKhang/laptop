import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "TECHBLUE_SECRET_KEY",
    });
  }

  async validate(payload: any) {
    // Lấy ID linh hoạt từ token (thử cả payload.id, payload.userId hoặc payload.sub)
    const userId = payload.id || payload.userId || payload.sub;

    if (!userId) {
      throw new UnauthorizedException("Token không chứa thông tin định danh hợp lệ");
    }

    const user = await this.usersService.findById(Number(userId));
    if (!user) {
      throw new UnauthorizedException("Tài khoản trong Token không tồn tại");
    }

    const { password, ...result } = user;
    
    // Trả về thông tin user (đã bao gồm trường role: 'ADMIN') để RolesGuard kiểm tra
    return result;
  }
}