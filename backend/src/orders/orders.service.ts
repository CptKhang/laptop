import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { OrderStatus, Role } from "@prisma/client";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateOrderDto) {
    const { items, ...orderData } = dto;

    // 1. Kiểm tra mảng items từ Frontend gửi lên
    if (!items || items.length === 0) {
      throw new BadRequestException("Giỏ hàng trống");
    }

    // 2. Lấy thông tin sản phẩm từ DB để đối chiếu giá và tồn kho
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // 3. Tính toán tổng tiền và validate tồn kho
    let total = 0;
    const itemsToCreate = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      
      if (!product) {
        throw new NotFoundException(`Sản phẩm ID ${item.productId} không tồn tại`);
      }
      
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Sản phẩm ${product.name} không đủ hàng`);
      }

      total += Number(product.price) * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Lấy giá từ DB để bảo mật
      };
    });

    // 4. Thực hiện transaction: Tạo đơn hàng và trừ tồn kho
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          ...orderData,
          total,
          items: {
            create: itemsToCreate,
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Trừ kho
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

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