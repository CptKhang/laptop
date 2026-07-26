import { describe, beforeEach, expect, it, jest } from '@jest/globals';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn().mockReturnValue('token'),
  };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService.sign.mockReturnValue('token');
    service = new AuthService(usersService as never, jwtService as never);
  });

  it('normalizes email and always registers a customer', async () => {
    usersService.findByEmail.mockResolvedValue(null as never);
    usersService.createUser.mockResolvedValue({
      id: 1,
      email: 'buyer@example.com',
      password: 'hash',
      fullName: 'Buyer',
      phone: null,
      address: null,
      role: Role.USER,
    } as never);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash' as never);

    const result = await service.register({
      fullName: 'Buyer',
      email: ' Buyer@Example.com ',
      password: '123456',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith('buyer@example.com');
    expect(usersService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'buyer@example.com',
        role: Role.USER,
      }),
    );
    expect(result.data).not.toHaveProperty('password');
  });

  it('rejects a duplicate registration with ConflictException', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 1 } as never);

    await expect(
      service.register({
        fullName: 'Buyer',
        email: 'buyer@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('maps a concurrent duplicate email to ConflictException', async () => {
    usersService.findByEmail.mockResolvedValue(null as never);
    usersService.createUser.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.0',
      }) as never,
    );
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash' as never);

    await expect(
      service.register({
        fullName: 'Buyer',
        email: 'buyer@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('allows USER through customer login and rejects ADMIN', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
    usersService.findByEmail.mockResolvedValueOnce({
      id: 1,
      email: 'buyer@example.com',
      password: 'hash',
      fullName: 'Buyer',
      role: Role.USER,
    } as never);

    await expect(
      service.loginCustomer({
        email: ' Buyer@Example.com ',
        password: '123456',
      }),
    ).resolves.toMatchObject({
      access_token: 'token',
      user: { id: 1, email: 'buyer@example.com', role: Role.USER },
    });

    usersService.findByEmail.mockResolvedValueOnce({
      id: 2,
      email: 'admin@example.com',
      password: 'hash',
      fullName: 'Admin',
      role: Role.ADMIN,
    } as never);

    await expect(
      service.loginCustomer({
        email: 'admin@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('allows ADMIN through admin login and rejects USER', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
    usersService.findByEmail.mockResolvedValueOnce({
      id: 2,
      email: 'admin@example.com',
      password: 'hash',
      fullName: 'Admin',
      role: Role.ADMIN,
    } as never);

    await expect(
      service.loginAdmin({
        email: 'admin@example.com',
        password: '123456',
      }),
    ).resolves.toMatchObject({
      access_token: 'token',
      user: { id: 2, email: 'admin@example.com', role: Role.ADMIN },
    });

    usersService.findByEmail.mockResolvedValueOnce({
      id: 1,
      email: 'buyer@example.com',
      password: 'hash',
      fullName: 'Buyer',
      role: Role.USER,
    } as never);

    await expect(
      service.loginAdmin({
        email: 'buyer@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects missing users and incorrect passwords', async () => {
    usersService.findByEmail.mockResolvedValueOnce(null as never);

    await expect(
      service.loginCustomer({
        email: 'missing@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    usersService.findByEmail.mockResolvedValueOnce({
      id: 1,
      email: 'buyer@example.com',
      password: 'hash',
      role: Role.USER,
    } as never);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false as never);

    await expect(
      service.loginCustomer({
        email: 'buyer@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
