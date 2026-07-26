import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const validateDto = <T extends object>(type: new () => T, value: object) => {
  const dto = plainToInstance(type, value);
  return {
    dto,
    errors: validate(dto, { whitelist: true, forbidNonWhitelisted: true }),
  };
};

describe('Authentication DTOs', () => {
  it('rejects role assignment during public registration', async () => {
    const { errors } = validateDto(RegisterDto, {
      fullName: 'Buyer',
      email: 'buyer@example.com',
      password: '123456',
      role: 'ADMIN',
    });

    expect((await errors).some((error) => error.property === 'role')).toBe(
      true,
    );
  });

  it.each([
    { fullName: 'A', email: 'buyer@example.com', password: '123456' },
    { fullName: 'Buyer', email: 'buyer@example.com', password: '12345' },
    { fullName: 'Buyer', email: 'buyer@example.com', password: 'a'.repeat(73) },
    {
      fullName: 'Buyer',
      email: 'buyer@example.com',
      password: '123456',
      phone: 'invalid',
    },
  ])('rejects invalid registration boundaries', async (value) => {
    const { errors } = validateDto(RegisterDto, value);
    expect(await errors).not.toHaveLength(0);
  });

  it('normalizes login email', async () => {
    const { dto, errors } = validateDto(LoginDto, {
      email: '  Buyer@Example.com  ',
      password: '123456',
    });

    expect(await errors).toHaveLength(0);
    expect(dto.email).toBe('buyer@example.com');
  });
});
