import { describe, expect, it } from '@jest/globals';
import { OrderStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CancelOrderDto } from './cancel-order.dto';
import { UpdateStatusDto } from './update-status.dto';

const validateDto = <T extends object>(type: new () => T, value: object) => {
  const dto = plainToInstance(type, value);
  return { dto, errors: validate(dto, { forbidUnknownValues: false }) };
};

describe('CancelOrderDto', () => {
  it.each(['', '   ', 'no', 'a'.repeat(501)])(
    'rejects an invalid cancellation reason',
    async (reason) => {
      const { errors } = validateDto(CancelOrderDto, { reason });

      expect(await errors).not.toHaveLength(0);
    },
  );

  it('trims and accepts a valid cancellation reason', async () => {
    const { dto, errors } = validateDto(CancelOrderDto, {
      reason: '  Changed my mind  ',
    });

    expect(await errors).toHaveLength(0);
    expect(dto.reason).toBe('Changed my mind');
  });
});

describe('UpdateStatusDto', () => {
  it('accepts an optional trimmed transition reason', async () => {
    const { dto, errors } = validateDto(UpdateStatusDto, {
      status: OrderStatus.CONFIRMED,
      reason: '  Payment verified  ',
    });

    expect(await errors).toHaveLength(0);
    expect(dto.reason).toBe('Payment verified');
  });

  it('rejects a transition reason longer than 500 characters', async () => {
    const { errors } = validateDto(UpdateStatusDto, {
      status: OrderStatus.CONFIRMED,
      reason: 'a'.repeat(501),
    });

    expect(await errors).not.toHaveLength(0);
  });
});
