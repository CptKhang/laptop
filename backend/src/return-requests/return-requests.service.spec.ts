import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  Prisma,
  ReturnRequestStatus,
  ReturnRequestType,
} from '@prisma/client';
import { ReturnRequestsService } from './return-requests.service';

const validDto = {
  orderId: 4,
  type: ReturnRequestType.RETURN,
  reason: 'The device is defective',
};

const safeUserSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  address: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

describe('ReturnRequestsService', () => {
  const prisma = {
    order: {
      findUnique: jest.fn(),
    },
    returnRequest: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  let service: ReturnRequestsService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-07-26T12:00:00.000Z'));
    prisma.returnRequest.findFirst.mockResolvedValue(null as never);
    prisma.returnRequest.create.mockResolvedValue({ id: 1 } as never);
    prisma.returnRequest.updateMany.mockResolvedValue({ count: 1 } as never);
    service = new ReturnRequestsService(prisma as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('accepts a request exactly 168 hours after completion', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 4,
        userId: 9,
        status: OrderStatus.COMPLETED,
        completedAt: new Date('2026-07-19T12:00:00.000Z'),
      } as never);

      await expect(service.create(9, validDto)).resolves.toEqual({ id: 1 });
      expect(prisma.returnRequest.create).toHaveBeenCalledWith({
        data: {
          orderId: 4,
          activeOrderId: 4,
          userId: 9,
          type: ReturnRequestType.RETURN,
          reason: 'The device is defective',
        },
        include: { order: true },
      });
    });

    it('rejects a request one millisecond after 168 hours', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 4,
        userId: 9,
        status: OrderStatus.COMPLETED,
        completedAt: new Date('2026-07-19T11:59:59.999Z'),
      } as never);

      await expect(service.create(9, validDto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.returnRequest.create).not.toHaveBeenCalled();
    });

    it('rejects a missing order', async () => {
      prisma.order.findUnique.mockResolvedValue(null as never);

      await expect(service.create(9, validDto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it("rejects a request for another customer's order", async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 4,
        userId: 8,
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      } as never);

      await expect(service.create(9, validDto)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it.each([
      { status: OrderStatus.PENDING, completedAt: null },
      { status: OrderStatus.COMPLETED, completedAt: null },
    ])('rejects an ineligible order', async (order) => {
      prisma.order.findUnique.mockResolvedValue({
        id: 4,
        userId: 9,
        ...order,
      } as never);

      await expect(service.create(9, validDto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it.each([ReturnRequestStatus.PENDING, ReturnRequestStatus.APPROVED])(
      'rejects a duplicate active %s request',
      async (status) => {
        prisma.order.findUnique.mockResolvedValue({
          id: 4,
          userId: 9,
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
        } as never);
        prisma.returnRequest.findFirst.mockResolvedValue({
          id: 2,
          status,
        } as never);

        await expect(service.create(9, validDto)).rejects.toBeInstanceOf(
          ConflictException,
        );
      },
    );

    it('rejects a concurrent active request creation', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 4,
        userId: 9,
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      } as never);
      prisma.returnRequest.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '6.19.0',
        }) as never,
      );

      await expect(service.create(9, validDto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('customer queries', () => {
    it('returns paginated requests scoped to the customer', async () => {
      prisma.returnRequest.findMany.mockResolvedValue([{ id: 2 }] as never);
      prisma.returnRequest.count.mockResolvedValue(21 as never);

      const result = await service.findMine(9, {
        page: 2,
        limit: 20,
        status: ReturnRequestStatus.PENDING,
      });

      expect(prisma.returnRequest.findMany).toHaveBeenCalledWith({
        where: { userId: 9, status: ReturnRequestStatus.PENDING },
        include: { order: true },
        orderBy: { createdAt: 'desc' },
        skip: 20,
        take: 20,
      });
      expect(result).toEqual({
        items: [{ id: 2 }],
        total: 21,
        page: 2,
        limit: 20,
        totalPages: 2,
      });
    });

    it('enforces detail ownership', async () => {
      prisma.returnRequest.findUnique.mockResolvedValue({
        id: 3,
        userId: 8,
      } as never);

      await expect(service.findMineById(3, 9)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('administrator workflow', () => {
    it('lists requests with status filtering', async () => {
      prisma.returnRequest.findMany.mockResolvedValue([{ id: 2 }] as never);
      prisma.returnRequest.count.mockResolvedValue(1 as never);

      await service.findAll({
        page: 1,
        limit: 10,
        status: ReturnRequestStatus.APPROVED,
      });

      expect(prisma.returnRequest.findMany).toHaveBeenCalledWith({
        where: { status: ReturnRequestStatus.APPROVED },
        include: {
          order: true,
          user: { select: safeUserSelect },
          reviewedBy: { select: safeUserSelect },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('loads administrator detail without password hashes', async () => {
      prisma.returnRequest.findUnique.mockResolvedValue({ id: 5 } as never);

      await service.findOneForAdmin(5);

      expect(prisma.returnRequest.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
        include: {
          order: { include: { items: { include: { product: true } } } },
          user: { select: safeUserSelect },
          reviewedBy: { select: safeUserSelect },
        },
      });
    });

    it.each([
      [ReturnRequestStatus.PENDING, ReturnRequestStatus.APPROVED],
      [ReturnRequestStatus.PENDING, ReturnRequestStatus.REJECTED],
      [ReturnRequestStatus.APPROVED, ReturnRequestStatus.COMPLETED],
    ])('allows %s to %s', async (fromStatus, toStatus) => {
      prisma.returnRequest.findUnique.mockResolvedValue({
        id: 5,
        status: fromStatus,
      } as never);

      await service.updateStatus(
        5,
        { status: toStatus, adminNote: 'Reviewed' },
        12,
      );

      expect(prisma.returnRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 5, status: fromStatus },
        data: expect.objectContaining({
          status: toStatus,
          reviewedById: 12,
          adminNote: 'Reviewed',
        }),
      });
    });

    it('sets reviewedAt when approving a request', async () => {
      prisma.returnRequest.findUnique.mockResolvedValue({
        id: 5,
        status: ReturnRequestStatus.PENDING,
      } as never);

      await service.updateStatus(
        5,
        { status: ReturnRequestStatus.APPROVED },
        12,
      );

      expect(prisma.returnRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 5, status: ReturnRequestStatus.PENDING },
        data: {
          status: ReturnRequestStatus.APPROVED,
          reviewedById: 12,
          reviewedAt: expect.any(Date),
        },
      });
    });

    it('sets completedAt when completing an approved request', async () => {
      prisma.returnRequest.findUnique.mockResolvedValue({
        id: 5,
        status: ReturnRequestStatus.APPROVED,
      } as never);

      await service.updateStatus(
        5,
        { status: ReturnRequestStatus.COMPLETED },
        12,
      );

      expect(prisma.returnRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 5, status: ReturnRequestStatus.APPROVED },
        data: {
          status: ReturnRequestStatus.COMPLETED,
          reviewedById: 12,
          completedAt: expect.any(Date),
          activeOrderId: null,
        },
      });
    });

    it('clears the active marker when rejecting a request', async () => {
      prisma.returnRequest.findUnique.mockResolvedValue({
        id: 5,
        status: ReturnRequestStatus.PENDING,
      } as never);

      await service.updateStatus(
        5,
        { status: ReturnRequestStatus.REJECTED },
        12,
      );

      expect(prisma.returnRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 5, status: ReturnRequestStatus.PENDING },
        data: {
          status: ReturnRequestStatus.REJECTED,
          reviewedById: 12,
          reviewedAt: expect.any(Date),
          activeOrderId: null,
        },
      });
    });

    it.each([
      [ReturnRequestStatus.PENDING, ReturnRequestStatus.COMPLETED],
      [ReturnRequestStatus.APPROVED, ReturnRequestStatus.REJECTED],
      [ReturnRequestStatus.REJECTED, ReturnRequestStatus.APPROVED],
      [ReturnRequestStatus.COMPLETED, ReturnRequestStatus.APPROVED],
    ])('rejects %s to %s', async (fromStatus, toStatus) => {
      prisma.returnRequest.findUnique.mockResolvedValue({
        id: 5,
        status: fromStatus,
      } as never);

      await expect(
        service.updateStatus(5, { status: toStatus }, 12),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.returnRequest.updateMany).not.toHaveBeenCalled();
    });

    it('rejects a concurrent state change', async () => {
      prisma.returnRequest.findUnique.mockResolvedValue({
        id: 5,
        status: ReturnRequestStatus.PENDING,
      } as never);
      prisma.returnRequest.updateMany.mockResolvedValue({ count: 0 } as never);

      await expect(
        service.updateStatus(5, { status: ReturnRequestStatus.APPROVED }, 12),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
