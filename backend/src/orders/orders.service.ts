import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { OrderStatus, Role } from "@prisma/client";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException("Giỏ hàng trống");
    }

    let total = 0;
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`Sản phẩm ${item.product.name} không đủ hàng`);
      }
      total += Number(item.product.price) * item.quantity;
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          receiverName: dto.receiverName,
          phone: dto.phone,
          address: dto.address,
          note: dto.note,
          total,
          paymentMethod: dto.paymentMethod,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return {
      ...order,
      orderCode: `TB${order.id}`,
    };
  }

  async findAll(userId: number, role: Role) {
    const where = role === Role.ADMIN ? {} : { userId };
    return this.prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number, userId: number, role: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException("Order not found");
    if (role !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException("Bạn không có quyền xem đơn hàng này");
    }
    return order;
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException("Order not found");

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException("Không thể cập nhật trạng thái đơn hàng đã hoàn thành hoặc đã hủy");
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { items: { include: { product: true } } },
    });
  }
}
