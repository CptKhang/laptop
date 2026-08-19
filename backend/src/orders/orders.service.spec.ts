import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentMethod, Prisma, Role } from '@prisma/client';
import { OrdersService } from './orders.service';

const validOrderDto = {
  receiverName: 'Buyer',
  phone: '+84901234567',
  address: 'Ho Chi Minh City',
  paymentMethod: PaymentMethod.COD,
  items: [{ productId: 3, quantity: 2 }],
};

describe('OrdersService', () => {
  const tx = {
    product: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    cartItem: {
      deleteMany: jest.fn(),
    },
  };
  const prisma = {
    product: {
      findMany: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    orderStatusHistory: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  let service: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    const product = {
      id: 3,
      name: 'Laptop',
      price: new Prisma.Decimal(100),
      stock: 5,
    };
    prisma.product.findMany.mockResolvedValue([product] as never);
    tx.product.findMany.mockResolvedValue([product] as never);
    tx.product.update.mockResolvedValue(product as never);
    tx.product.updateMany.mockResolvedValue({ count: 1 } as never);
    tx.order.create.mockResolvedValue({
      id: 10,
      status: OrderStatus.PENDING,
      paymentMethod: PaymentMethod.COD,
    } as never);
    tx.orderStatusHistory.create.mockResolvedValue({ id: 1 } as never);
    prisma.order.update.mockResolvedValue({ id: 5 } as never);
    prisma.$transaction.mockImplementation(async (callback: any) =>
      callback(tx),
    );
    service = new OrdersService(prisma as never);
  });

  describe('create', () => {
    it('rejects duplicate product IDs before opening a transaction', async () => {
      await expect(
        service.create(1, {
          ...validOrderDto,
          items: [
            { productId: 3, quantity: 1 },
            { productId: 3, quantity: 2 },
          ],
        } as never),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('uses database prices, conditionally decrements stock, and records PENDING', async () => {
      tx.product.findMany.mockResolvedValue([
        {
          id: 3,
          name: 'Laptop',
          price: new Prisma.Decimal(100),
          stock: 5,
        },
      ] as never);
      tx.product.updateMany.mockResolvedValue({ count: 1 } as never);
      tx.order.create.mockResolvedValue({
        id: 10,
        status: OrderStatus.PENDING,
        paymentMethod: PaymentMethod.COD,
      } as never);
      tx.orderStatusHistory.create.mockResolvedValue({ id: 1 } as never);

      const result = await service.create(1, validOrderDto as never);

      expect(tx.product.updateMany).toHaveBeenCalledWith({
        where: { id: 3, stock: { gte: 2 } },
        data: { stock: { decrement: 2 } },
      });
      expect(tx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 1,
            total: new Prisma.Decimal(200),
            items: {
              create: [
                {
                  productId: 3,
                  quantity: 2,
                  price: new Prisma.Decimal(100),
                },
              ],
            },
          }),
        }),
      );
      expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
        data: {
          orderId: 10,
          fromStatus: null,
          toStatus: OrderStatus.PENDING,
          actorUserId: 1,
        },
      });
      expect(tx.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cart: { userId: 1 } },
      });
      expect(result).toEqual(
        expect.objectContaining({ id: 10, orderCode: 'TB10' }),
      );
    });

    it('keeps the cart while waiting for MoMo payment confirmation', async () => {
      tx.order.create.mockResolvedValue({
        id: 10,
        status: OrderStatus.PENDING,
        paymentMethod: PaymentMethod.MOMO,
      } as never);

      await service.create(1, {
        ...validOrderDto,
        paymentMethod: PaymentMethod.MOMO,
      } as never);

      expect(tx.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it('rejects missing products', async () => {
      prisma.product.findMany.mockResolvedValue([] as never);
      tx.product.findMany.mockResolvedValue([] as never);

      await expect(
        service.create(1, validOrderDto as never),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects stock races when conditional decrement affects no row', async () => {
      tx.product.findMany.mockResolvedValue([
        {
          id: 3,
          name: 'Laptop',
          price: new Prisma.Decimal(100),
          stock: 5,
        },
      ] as never);
      tx.product.updateMany.mockResolvedValue({ count: 0 } as never);

      await expect(
        service.create(1, validOrderDto as never),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(tx.order.create).not.toHaveBeenCalled();
    });
  });

  describe('payment status updates', () => {
    it('clears the order owner cart after a successful MoMo payment', async () => {
      tx.order.findUnique.mockResolvedValue({
        id: 10,
        userId: 1,
        status: OrderStatus.PENDING,
        paymentStatus: 'UNPAID',
      } as never);
      tx.order.update.mockResolvedValue({
        id: 10,
        paymentStatus: 'PAID',
      } as never);

      await service.updatePaymentStatus(10, 'PAID');

      expect(tx.order.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: {
          paymentStatus: 'PAID',
          transactionId: 'MOMO_SUCCESS',
        },
      });
      expect(tx.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cart: { userId: 1 } },
      });
    });

    it('does not clear the cart for a failed payment', async () => {
      tx.order.findUnique.mockResolvedValue({
        id: 10,
        userId: 1,
        status: OrderStatus.PENDING,
        paymentStatus: 'UNPAID',
      } as never);
      tx.order.update.mockResolvedValue({
        id: 10,
        paymentStatus: 'FAILED',
      } as never);

      await service.updatePaymentStatus(10, 'FAILED');

      expect(tx.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it('does not clear the cart again for a duplicate successful payment', async () => {
      const paidOrder = {
        id: 10,
        userId: 1,
        status: OrderStatus.PENDING,
        paymentStatus: 'PAID',
      };
      tx.order.findUnique.mockResolvedValue(paidOrder as never);

      await expect(service.updatePaymentStatus(10, 'PAID')).resolves.toEqual(
        paidOrder,
      );

      expect(tx.order.update).not.toHaveBeenCalled();
      expect(tx.cartItem.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('cancellation', () => {
    it('exposes a customer cancellation operation', () => {
      expect(typeof (service as any).cancel).toBe('function');
    });

    it('cancels an owned PENDING order and restores every item', async () => {
      tx.order.findUnique.mockResolvedValue({
        id: 5,
        userId: 1,
        status: OrderStatus.PENDING,
        items: [
          { productId: 3, quantity: 2 },
          { productId: 4, quantity: 1 },
        ],
      } as never);
      tx.order.updateMany.mockResolvedValue({ count: 1 } as never);
      tx.product.update.mockResolvedValue({} as never);

      await service.cancel(5, 1, { reason: 'Changed my mind' });

      expect(tx.order.updateMany).toHaveBeenCalledWith({
        where: { id: 5, status: OrderStatus.PENDING },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: expect.any(Date),
          cancelReason: 'Changed my mind',
        },
      });
      expect(tx.product.update).toHaveBeenNthCalledWith(1, {
        where: { id: 3 },
        data: { stock: { increment: 2 } },
      });
      expect(tx.product.update).toHaveBeenNthCalledWith(2, {
        where: { id: 4 },
        data: { stock: { increment: 1 } },
      });
      expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
        data: {
          orderId: 5,
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.CANCELLED,
          actorUserId: 1,
          reason: 'Changed my mind',
        },
      });
    });

    it('rejects cancellation by another customer', async () => {
      tx.order.findUnique.mockResolvedValue({
        id: 5,
        userId: 2,
        status: OrderStatus.PENDING,
        items: [],
      } as never);

      await expect(
        service.cancel(5, 1, { reason: 'Changed my mind' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it.each([
      OrderStatus.CONFIRMED,
      OrderStatus.SHIPPING,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ])('rejects customer cancellation from %s', async (status) => {
      tx.order.findUnique.mockResolvedValue({
        id: 5,
        userId: 1,
        status,
        items: [],
      } as never);

      await expect(
        service.cancel(5, 1, { reason: 'Changed my mind' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('does not restore stock when another request already cancelled the order', async () => {
      tx.order.findUnique.mockResolvedValue({
        id: 5,
        userId: 1,
        status: OrderStatus.PENDING,
        items: [{ productId: 3, quantity: 2 }],
      } as never);
      tx.order.updateMany.mockResolvedValue({ count: 0 } as never);

      await expect(
        service.cancel(5, 1, { reason: 'Changed my mind' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(tx.product.update).not.toHaveBeenCalled();
    });
  });

  describe('administrator transitions', () => {
    it('moves PENDING to CONFIRMED and writes history', async () => {
      const order = {
        id: 5,
        userId: 1,
        status: OrderStatus.PENDING,
        items: [],
      };
      prisma.order.findUnique.mockResolvedValue(order as never);
      tx.order.findUnique.mockResolvedValue(order as never);
      tx.order.updateMany.mockResolvedValue({ count: 1 } as never);

      await (service as any).updateStatus(
        5,
        { status: OrderStatus.CONFIRMED, reason: 'Payment verified' },
        9,
      );

      expect(tx.order.updateMany).toHaveBeenCalledWith({
        where: { id: 5, status: OrderStatus.PENDING },
        data: { status: OrderStatus.CONFIRMED },
      });
      expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
        data: {
          orderId: 5,
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.CONFIRMED,
          actorUserId: 9,
          reason: 'Payment verified',
        },
      });
    });

    it('rejects a transition that skips required states', async () => {
      const order = {
        id: 5,
        userId: 1,
        status: OrderStatus.CONFIRMED,
        items: [],
      };
      prisma.order.findUnique.mockResolvedValue(order as never);
      tx.order.findUnique.mockResolvedValue(order as never);

      await expect(
        (service as any).updateStatus(5, { status: OrderStatus.COMPLETED }, 9),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('sets completedAt when SHIPPING becomes COMPLETED', async () => {
      tx.order.findUnique.mockResolvedValue({
        id: 5,
        userId: 1,
        status: OrderStatus.SHIPPING,
        items: [],
      } as never);
      tx.order.updateMany.mockResolvedValue({ count: 1 } as never);

      await (service as any).updateStatus(
        5,
        { status: OrderStatus.COMPLETED },
        9,
      );

      expect(tx.order.updateMany).toHaveBeenCalledWith({
        where: { id: 5, status: OrderStatus.SHIPPING },
        data: {
          status: OrderStatus.COMPLETED,
          completedAt: expect.any(Date),
        },
      });
    });

    it('restores stock when an administrator cancels a PENDING order', async () => {
      tx.order.findUnique.mockResolvedValue({
        id: 5,
        userId: 1,
        status: OrderStatus.PENDING,
        items: [{ productId: 3, quantity: 2 }],
      } as never);
      tx.order.updateMany.mockResolvedValue({ count: 1 } as never);

      await service.updateStatus(
        5,
        { status: OrderStatus.CANCELLED, reason: 'Payment failed' },
        9,
      );

      expect(tx.order.updateMany).toHaveBeenCalledWith({
        where: { id: 5, status: OrderStatus.PENDING },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: expect.any(Date),
          cancelReason: 'Payment failed',
        },
      });
      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { stock: { increment: 2 } },
      });
      expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
        data: {
          orderId: 5,
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.CANCELLED,
          actorUserId: 9,
          reason: 'Payment failed',
        },
      });
    });

    it('requires a reason when an administrator cancels an order', async () => {
      tx.order.findUnique.mockResolvedValue({
        id: 5,
        userId: 1,
        status: OrderStatus.PENDING,
        items: [],
      } as never);

      await expect(
        service.updateStatus(5, { status: OrderStatus.CANCELLED }, 9),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(tx.order.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('queries', () => {
    it('returns paginated orders scoped to the customer', async () => {
      prisma.order.findMany.mockResolvedValue([{ id: 2 }] as never);
      prisma.order.count.mockResolvedValue(21 as never);

      const result = await (service as any).findAll(7, Role.USER, {
        page: 2,
        limit: 20,
        status: OrderStatus.PENDING,
      });

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { userId: 7, status: OrderStatus.PENDING },
        include: { items: { include: { product: true } } },
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

    it('enforces order detail ownership', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 8, userId: 3 } as never);

      await expect(service.findOne(8, 7, Role.USER)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('returns status history for the order owner', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 8, userId: 7 } as never);
      prisma.orderStatusHistory.findMany.mockResolvedValue([
        { id: 1, toStatus: OrderStatus.PENDING },
      ] as never);

      const result = await (service as any).findStatusHistory(8, 7, Role.USER);

      expect(prisma.orderStatusHistory.findMany).toHaveBeenCalledWith({
        where: { orderId: 8 },
        include: {
          actor: { select: { id: true, fullName: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual([{ id: 1, toStatus: OrderStatus.PENDING }]);
    });

    it('rejects status history access by another customer', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 8, userId: 3 } as never);

      await expect(
        (service as any).findStatusHistory(8, 7, Role.USER),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.orderStatusHistory.findMany).not.toHaveBeenCalled();
    });
  });
});
