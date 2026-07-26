import 'reflect-metadata';
import { describe, expect, it } from '@jest/globals';
import { ReturnRequestStatus, ReturnRequestType } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReturnRequestDto } from './create-return-request.dto';
import { ReturnRequestQueryDto } from './return-request-query.dto';
import { UpdateReturnRequestStatusDto } from './update-return-request-status.dto';

const validateDto = <T extends object>(type: new () => T, value: object) => {
  const dto = plainToInstance(type, value);
  return {
    dto,
    errors: validate(dto, { whitelist: true, forbidNonWhitelisted: true }),
  };
};

describe('Return request DTOs', () => {
  it.each(['INVALID', undefined])(
    'rejects invalid request type %s',
    async (type) => {
      const { errors } = validateDto(CreateReturnRequestDto, {
        orderId: 4,
        type,
        reason: 'The device is defective',
      });

      expect(await errors).not.toHaveLength(0);
    },
  );

  it.each(['short', 'a'.repeat(1001)])(
    'rejects invalid request reasons',
    async (reason) => {
      const { errors } = validateDto(CreateReturnRequestDto, {
        orderId: 4,
        type: ReturnRequestType.RETURN,
        reason,
      });

      expect(await errors).not.toHaveLength(0);
    },
  );

  it('trims a valid request reason', async () => {
    const { dto, errors } = validateDto(CreateReturnRequestDto, {
      orderId: 4,
      type: ReturnRequestType.EXCHANGE,
      reason: '  The device is defective  ',
    });

    expect(await errors).toHaveLength(0);
    expect(dto.reason).toBe('The device is defective');
  });

  it('rejects admin notes longer than 1000 characters', async () => {
    const { errors } = validateDto(UpdateReturnRequestStatusDto, {
      status: ReturnRequestStatus.APPROVED,
      adminNote: 'a'.repeat(1001),
    });

    expect(await errors).not.toHaveLength(0);
  });

  it('rejects pagination limits above 100', async () => {
    const { errors } = validateDto(ReturnRequestQueryDto, {
      page: 1,
      limit: 101,
    });

    expect(await errors).not.toHaveLength(0);
  });
});
