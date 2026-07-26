import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(prisma as never);
  });

  it('normalizes email lookups', async () => {
    prisma.user.findUnique.mockResolvedValue(null as never);

    await service.findByEmail(' Buyer@Example.com ');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'buyer@example.com' },
    });
  });

  it('updates only profile fields and omits password from the result', async () => {
    prisma.user.update.mockResolvedValue({
      id: 7,
      fullName: 'Buyer',
      email: 'buyer@example.com',
      phone: '+84901234567',
      address: 'Ho Chi Minh City',
      role: 'USER',
    } as never);

    await service.updateProfile(7, {
      fullName: 'Buyer',
      phone: '+84901234567',
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        fullName: 'Buyer',
        phone: '+84901234567',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
      },
    });
  });
});
