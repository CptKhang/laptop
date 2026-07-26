import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPING],
  [OrderStatus.SHIPPING]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateOrderDto) {
    const { items, ...orderData } = dto;
    if (items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    const productIds = items.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new BadRequestException('Sản phẩm trong đơn hàng bị trùng');
    }

    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );

      let total = new Prisma.Decimal(0);
      const itemsToCreate = items.map((item) => {
        const product = productsById.get(item.productId);
        if (!product) {
          throw new NotFoundException(
            `Sản phẩm ID ${item.productId} không tồn tại`,
          );
        }

        total = total.plus(product.price.mul(item.quantity));
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      });

      for (const item of items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          throw new BadRequestException(
            `Sản phẩm ID ${item.productId} không đủ hàng`,
          );
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          ...orderData,
          total,
          items: { create: itemsToCreate },
        },
        include: { items: { include: { product: true } } },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: OrderStatus.PENDING,
          actorUserId: userId,
        },
      });

      return {
        ...order,
        orderCode: `TB${order.id}`,
      };
    });
  }

  async cancel(id: number, userId: number, dto: CancelOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      if (order.userId !== userId) {
        throw new ForbiddenException('Bạn không có quyền hủy đơn hàng này');
      }
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Chỉ có thể hủy đơn hàng đang chờ xử lý');
      }

      const updated = await tx.order.updateMany({
        where: { id, status: OrderStatus.PENDING },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: dto.reason,
        },
      });
      if (updated.count !== 1) {
        throw new BadRequestException('Trạng thái đơn hàng đã thay đổi');
      }

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.CANCELLED,
          actorUserId: userId,
          reason: dto.reason,
        },
      });

      return tx.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      });
    });
  }

  async findAll(
    userId: number,
    role: Role,
    query: OrderQueryDto = new OrderQueryDto(),
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.OrderWhereInput = {
      ...(role === Role.ADMIN ? {} : { userId }),
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId: number, role: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (role !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }
    return order;
  }

  async findStatusHistory(id: number, userId: number, role: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (role !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }

    return this.prisma.orderStatusHistory.findMany({
      where: { orderId: id },
      include: {
        actor: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateStatus(id: number, dto: UpdateStatusDto, actorUserId: number) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      if (!ORDER_STATUS_TRANSITIONS[order.status].includes(dto.status)) {
        throw new BadRequestException(
          'Chuyển trạng thái đơn hàng không hợp lệ',
        );
      }
      if (dto.status === OrderStatus.CANCELLED && !dto.reason) {
        throw new BadRequestException('Cần cung cấp lý do hủy đơn hàng');
      }

      const data: Prisma.OrderUpdateManyMutationInput = {
        status: dto.status,
        ...(dto.status === OrderStatus.COMPLETED
          ? { completedAt: new Date() }
          : {}),
        ...(dto.status === OrderStatus.CANCELLED
          ? { cancelledAt: new Date(), cancelReason: dto.reason }
          : {}),
      };
      const updated = await tx.order.updateMany({
        where: { id, status: order.status },
        data,
      });
      if (updated.count !== 1) {
        throw new BadRequestException('Trạng thái đơn hàng đã thay đổi');
      }

      if (dto.status === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: dto.status,
          actorUserId,
          reason: dto.reason,
        },
      });

      return tx.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      });
    });
  }
}
