import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, ReturnRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { ReturnRequestQueryDto } from './dto/return-request-query.dto';
import { UpdateReturnRequestStatusDto } from './dto/update-return-request-status.dto';
import { RETURN_REQUEST_TRANSITIONS } from './return-request.transitions';

const RETURN_WINDOW_MS = 168 * 60 * 60 * 1000;
const SAFE_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  address: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class ReturnRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateReturnRequestDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền yêu cầu đổi trả đơn này',
      );
    }
    if (order.status !== OrderStatus.COMPLETED || !order.completedAt) {
      throw new BadRequestException('Đơn hàng chưa đủ điều kiện đổi trả');
    }

    const deadline = order.completedAt.getTime() + RETURN_WINDOW_MS;
    if (Date.now() > deadline) {
      throw new BadRequestException('Đã quá thời hạn đổi trả 7 ngày');
    }

    const activeRequest = await this.prisma.returnRequest.findFirst({
      where: {
        orderId: dto.orderId,
        status: {
          in: [ReturnRequestStatus.PENDING, ReturnRequestStatus.APPROVED],
        },
      },
    });
    if (activeRequest) {
      throw new ConflictException('Đơn hàng đã có yêu cầu đổi trả đang xử lý');
    }

    try {
      return await this.prisma.returnRequest.create({
        data: {
          orderId: dto.orderId,
          activeOrderId: dto.orderId,
          userId,
          type: dto.type,
          reason: dto.reason,
        },
        include: { order: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Đơn hàng đã có yêu cầu đổi trả đang xử lý',
        );
      }
      throw error;
    }
  }

  async findMine(
    userId: number,
    query: ReturnRequestQueryDto = new ReturnRequestQueryDto(),
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ReturnRequestWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.returnRequest.findMany({
        where,
        include: { order: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.returnRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMineById(id: number, userId: number) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: {
        order: { include: { items: { include: { product: true } } } },
      },
    });
    if (!request) {
      throw new NotFoundException('Return request not found');
    }
    if (request.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem yêu cầu này');
    }
    return request;
  }

  async findAll(query: ReturnRequestQueryDto = new ReturnRequestQueryDto()) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ReturnRequestWhereInput = query.status
      ? { status: query.status }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.returnRequest.findMany({
        where,
        include: {
          order: true,
          user: { select: SAFE_USER_SELECT },
          reviewedBy: { select: SAFE_USER_SELECT },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.returnRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneForAdmin(id: number) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: {
        order: { include: { items: { include: { product: true } } } },
        user: { select: SAFE_USER_SELECT },
        reviewedBy: { select: SAFE_USER_SELECT },
      },
    });
    if (!request) {
      throw new NotFoundException('Return request not found');
    }
    return request;
  }

  async updateStatus(
    id: number,
    dto: UpdateReturnRequestStatusDto,
    adminId: number,
  ) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Return request not found');
    }
    if (!RETURN_REQUEST_TRANSITIONS[request.status].includes(dto.status)) {
      throw new BadRequestException('Chuyển trạng thái yêu cầu không hợp lệ');
    }

    const data: Prisma.ReturnRequestUncheckedUpdateManyInput = {
      status: dto.status,
      reviewedById: adminId,
      ...(dto.adminNote !== undefined ? { adminNote: dto.adminNote } : {}),
      ...(dto.status === ReturnRequestStatus.APPROVED ||
      dto.status === ReturnRequestStatus.REJECTED
        ? { reviewedAt: new Date() }
        : {}),
      ...(dto.status === ReturnRequestStatus.COMPLETED
        ? { completedAt: new Date() }
        : {}),
      ...(dto.status === ReturnRequestStatus.REJECTED ||
      dto.status === ReturnRequestStatus.COMPLETED
        ? { activeOrderId: null }
        : {}),
    };
    const updated = await this.prisma.returnRequest.updateMany({
      where: { id, status: request.status },
      data,
    });
    if (updated.count !== 1) {
      throw new BadRequestException('Trạng thái yêu cầu đã thay đổi');
    }

    return this.findOneForAdmin(id);
  }
}
