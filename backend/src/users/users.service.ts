import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

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

  async updateUser(id: number, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
      },
    });
  }
}
