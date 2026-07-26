import 'reflect-metadata';
import { describe, expect, it } from '@jest/globals';
import { PaymentMethod } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';
import { OrderQueryDto } from './order-query.dto';

const validOrder = {
  receiverName: 'Buyer',
  phone: '+84901234567',
  address: 'Ho Chi Minh City',
  paymentMethod: PaymentMethod.COD,
  items: [{ productId: 3, quantity: 1 }],
};

const validateDto = <T extends object>(type: new () => T, value: object) =>
  validate(plainToInstance(type, value), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

describe('Order DTOs', () => {
  it('rejects client-controlled item prices', async () => {
    const errors = await validateDto(CreateOrderDto, {
      ...validOrder,
      items: [{ productId: 3, quantity: 1, price: 1 }],
    });

    expect(errors).not.toHaveLength(0);
  });

  it.each([0, 1.5])('rejects invalid quantity %s', async (quantity) => {
    const errors = await validateDto(CreateOrderDto, {
      ...validOrder,
      items: [{ productId: 3, quantity }],
    });

    expect(errors).not.toHaveLength(0);
  });

  it('rejects pagination limits above 100', async () => {
    const errors = await validateDto(OrderQueryDto, { page: 1, limit: 101 });
    expect(errors).not.toHaveLength(0);
  });
});
