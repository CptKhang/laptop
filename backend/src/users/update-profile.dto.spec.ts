import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileDto } from './dto/update-profile.dto';

const validateDto = (value: object) =>
  validate(plainToInstance(UpdateProfileDto, value), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

describe('UpdateProfileDto', () => {
  it('rejects a whitespace-only full name', async () => {
    const errors = await validateDto({ fullName: '   ' });
    expect(errors.some((error) => error.property === 'fullName')).toBe(true);
  });

  it('rejects an invalid phone number', async () => {
    const errors = await validateDto({ phone: 'abc' });
    expect(errors.some((error) => error.property === 'phone')).toBe(true);
  });

  it('rejects identity and authorization fields', async () => {
    const errors = await validateDto({
      email: 'new@example.com',
      role: 'ADMIN',
      password: 'new-password',
    });
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['email', 'role', 'password']),
    );
  });

  it('trims and accepts valid profile fields', async () => {
    const dto = plainToInstance(UpdateProfileDto, {
      fullName: '  Buyer Name  ',
      phone: '+84901234567',
      address: '  Ho Chi Minh City  ',
    });
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors).toHaveLength(0);
    expect(dto.fullName).toBe('Buyer Name');
    expect(dto.address).toBe('Ho Chi Minh City');
  });
});
