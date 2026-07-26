import { describe, expect, it, jest } from '@jest/globals';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  it('protects profile routes with authentication guards', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, UsersController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
  });

  it('forwards the authenticated customer when updating a profile', async () => {
    const service = { updateProfile: jest.fn() };
    const controller = new UsersController(service as never);
    const dto = { fullName: 'Buyer' };

    await controller.updateProfile({ user: { id: 7 } }, dto);

    expect(service.updateProfile).toHaveBeenCalledWith(7, dto);
  });
});
