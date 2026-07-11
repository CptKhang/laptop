import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Tìm user theo email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  // Tìm user theo id
  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  // Tạo user mới
  async createUser(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role?: Role;
  }) {
    return this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: data.address,
        role: data.role ?? Role.USER,
      },
    });
  }

  // Cập nhật user
  async updateUser(id: number, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // Xóa user
  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}