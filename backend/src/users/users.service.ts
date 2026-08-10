import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
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
      orderBy: { createdAt: 'desc' },
    });
  }
  
  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    try {
      // Dùng transaction để dọn dẹp toàn bộ dữ liệu liên quan trước khi xóa user
      return await this.prisma.$transaction(async (tx) => {
        // 1. Xóa các lịch sử thay đổi trạng thái đơn hàng do user này thực hiện (bảng order_status_histories)
        await tx.orderStatusHistory.deleteMany({ where: { actorUserId: id } }).catch(() => {});

        // 2. Xóa hoặc cập nhật các yêu cầu đổi trả (return_requests) do user này tạo hoặc duyệt
        // Nếu bảng return_request có ràng buộc khóa ngoại trực tiếp, ta xóa các bản ghi liên quan:
        await tx.returnRequest.deleteMany({ where: { userId: id } }).catch(() => {});
        // Cập nhật các yêu cầu do admin này từng review thành null để tránh vướng khóa ngoại reviewedById
        await tx.returnRequest.updateMany({
          where: { reviewedById: id },
          data: { reviewedById: null },
        }).catch(() => {});

        // 3. Xóa giỏ hàng của user (bảng carts sẽ tự động xóa cartItems nếu có onDelete: Cascade, nhưng ta xóa items trước cho chắc)
        const cart = await tx.cart.findUnique({ where: { userId: id } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } }).catch(() => {});
          await tx.cart.delete({ where: { userId: id } }).catch(() => {});
        }

        // 4. Xóa các đơn hàng của user (Lưu ý: Nếu đơn hàng có orderItems, cần xóa orderItems trước)
        const userOrders = await tx.order.findMany({ where: { userId: id } });
        for (const order of userOrders) {
          await tx.orderItem.deleteMany({ where: { orderId: order.id } }).catch(() => {});
          await tx.orderStatusHistory.deleteMany({ where: { orderId: order.id } }).catch(() => {});
          await tx.returnRequest.deleteMany({ where: { orderId: order.id } }).catch(() => {});
          await tx.order.delete({ where: { id: order.id } }).catch(() => {});
        }

        // 5. Cuối cùng, sau khi đã dọn sạch các bảng liên quan, tiến hành xóa User
        return await tx.user.delete({ where: { id } });
      });
    } catch (error: any) {
      console.error("LỖI XÓA USER:", error);
      throw new BadRequestException(`Không thể xóa người dùng do vướng dữ liệu liên quan: ${error.message}`);
    }
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
