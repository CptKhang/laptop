import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ParseIntPipe } from '@nestjs/common';
import { GUARDS_METADATA, ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { OrderStatus, PaymentMethod, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ROLES_KEY } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersController } from './orders.controller';

const service = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findStatusHistory: jest.fn(),
  cancel: jest.fn(),
  updateStatus: jest.fn(),
};

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new OrdersController(service as never);
  });

  it('forwards the authenticated customer when creating an order', async () => {
    const dto = {
      receiverName: 'Buyer',
      phone: '+84901234567',
      address: 'Ho Chi Minh City',
      paymentMethod: PaymentMethod.COD,
      items: [{ productId: 3, quantity: 1 }],
    };

    await controller.create({ user: { id: 7 } }, dto);

    expect(service.create).toHaveBeenCalledWith(7, dto);
  });

  it('forwards pagination and status filters when listing orders', async () => {
    const req = { user: { id: 7, role: Role.USER } };
    const query = { page: 2, limit: 10, status: OrderStatus.PENDING };

    await (controller as any).findAll(req, query);

    expect(service.findAll).toHaveBeenCalledWith(7, Role.USER, query);
  });

  it('forwards the authenticated customer when cancelling an order', async () => {
    const req = { user: { id: 7 } };
    const dto = { reason: 'Changed my mind' };

    await (controller as any).cancel(req, 5, dto);

    expect(service.cancel).toHaveBeenCalledWith(5, 7, dto);
  });

  it('forwards identity and role when reading status history', async () => {
    const req = { user: { id: 7, role: Role.USER } };

    await (controller as any).findStatusHistory(req, 5);

    expect(service.findStatusHistory).toHaveBeenCalledWith(5, 7, Role.USER);
  });

  it('forwards the authenticated administrator when updating status', async () => {
    const req = { user: { id: 9 } };
    const dto = { status: OrderStatus.CONFIRMED };

    await (controller as any).updateStatus(req, 5, dto);

    expect(service.updateStatus).toHaveBeenCalledWith(5, dto, 9);
  });

  it.each(['cancel', 'findStatusHistory', 'findOne', 'updateStatus'])(
    'parses the order ID for %s',
    (methodName) => {
      const metadata = Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        OrdersController,
        methodName,
      );
      const pipes = Object.values(metadata ?? {}).flatMap(
        (argument: any) => argument.pipes ?? [],
      );

      expect(
        pipes.some(
          (pipe) => pipe === ParseIntPipe || pipe instanceof ParseIntPipe,
        ),
      ).toBe(true);
    },
  );

  it('protects order routes and restricts status updates to administrators', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, OrdersController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
    expect(
      Reflect.getMetadata(ROLES_KEY, OrdersController.prototype.updateStatus),
    ).toEqual([Role.ADMIN]);
  });
});
