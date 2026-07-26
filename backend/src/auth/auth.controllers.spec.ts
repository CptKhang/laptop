import { describe, expect, it, jest } from '@jest/globals';
import { RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  MODULE_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { AdminAuthController } from './admin-auth.controller';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { LoginDto } from './dto/login.dto';

const authService = {
  register: jest.fn(),
  login: jest.fn(),
  loginCustomer: jest.fn(),
  loginAdmin: jest.fn(),
};

describe('Auth controllers', () => {
  it('delegates customer login to loginCustomer', async () => {
    const controller = new AuthController(authService as never);
    const dto: LoginDto = {
      email: 'buyer@example.com',
      password: '123456',
    };

    await controller.login(dto);

    expect(authService.loginCustomer).toHaveBeenCalledWith(dto);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('defines a separate admin auth controller file', () => {
    expect(existsSync(resolve(__dirname, 'admin-auth.controller.ts'))).toBe(
      true,
    );
  });

  it('exposes an admin login method', () => {
    const controller = new (AdminAuthController as any)(authService);
    expect(typeof controller.login).toBe('function');
  });

  it('delegates admin login to loginAdmin', async () => {
    const controller = new AdminAuthController(authService as never);
    const dto: LoginDto = {
      email: 'admin@example.com',
      password: '123456',
    };

    await controller.login(dto);

    expect(authService.loginAdmin).toHaveBeenCalledWith(dto);
  });

  it('maps admin login to POST /admin/auth/login', () => {
    expect(Reflect.getMetadata(PATH_METADATA, AdminAuthController)).toBe(
      'admin/auth',
    );
    expect(
      Reflect.getMetadata(PATH_METADATA, AdminAuthController.prototype.login),
    ).toBe('login');
    expect(
      Reflect.getMetadata(METHOD_METADATA, AdminAuthController.prototype.login),
    ).toBe(RequestMethod.POST);
  });

  it('registers the admin controller in AuthModule', () => {
    const controllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      AuthModule,
    );
    expect(controllers).toContain(AdminAuthController);
  });

  it('keeps customer and administrator login routes public', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, AuthController),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(GUARDS_METADATA, AdminAuthController),
    ).toBeUndefined();
  });
});
