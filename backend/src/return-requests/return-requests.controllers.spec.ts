import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ReturnRequestStatus, ReturnRequestType, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ROLES_KEY } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AppModule } from '../app.module';
import { AdminReturnRequestsController } from './admin-return-requests.controller';
import { ReturnRequestsController } from './return-requests.controller';
import { ReturnRequestsModule } from './return-requests.module';

const service = {
  create: jest.fn(),
  findMine: jest.fn(),
  findMineById: jest.fn(),
  findAll: jest.fn(),
  findOneForAdmin: jest.fn(),
  updateStatus: jest.fn(),
};

describe('Return request controllers', () => {
  let customerController: ReturnRequestsController;
  let adminController: AdminReturnRequestsController;

  beforeEach(() => {
    jest.clearAllMocks();
    customerController = new ReturnRequestsController(service as never);
    adminController = new AdminReturnRequestsController(service as never);
  });

  it('forwards the customer when creating a request', async () => {
    const dto = {
      orderId: 4,
      type: ReturnRequestType.RETURN,
      reason: 'The device is defective',
    };

    await customerController.create({ user: { id: 9 } }, dto);

    expect(service.create).toHaveBeenCalledWith(9, dto);
  });

  it('forwards customer pagination and ownership', async () => {
    const query = { page: 2, limit: 10, status: ReturnRequestStatus.PENDING };

    await customerController.findMine({ user: { id: 9 } }, query);
    await customerController.findMineById({ user: { id: 9 } }, 5);

    expect(service.findMine).toHaveBeenCalledWith(9, query);
    expect(service.findMineById).toHaveBeenCalledWith(5, 9);
  });

  it('forwards administrator queries', async () => {
    const query = { page: 1, limit: 20 };

    await adminController.findAll(query);
    await adminController.findOne(5);

    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(service.findOneForAdmin).toHaveBeenCalledWith(5);
  });

  it('forwards the administrator actor when updating status', async () => {
    const dto = {
      status: ReturnRequestStatus.APPROVED,
      adminNote: 'Approved',
    };

    await adminController.updateStatus({ user: { id: 12 } }, 5, dto);

    expect(service.updateStatus).toHaveBeenCalledWith(5, dto, 12);
  });

  it('protects customer and administrator return routes', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, ReturnRequestsController),
    ).toEqual([JwtAuthGuard, RolesGuard]);
    expect(
      Reflect.getMetadata(GUARDS_METADATA, AdminReturnRequestsController),
    ).toEqual([JwtAuthGuard, RolesGuard]);
    expect(
      Reflect.getMetadata(ROLES_KEY, AdminReturnRequestsController),
    ).toEqual([Role.ADMIN]);
  });

  it('registers the return request module in the application', () => {
    expect(Reflect.getMetadata('imports', AppModule)).toContain(
      ReturnRequestsModule,
    );
  });
});
