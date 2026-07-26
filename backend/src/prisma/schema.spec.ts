import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Prisma schema', () => {
  const schema = readFileSync(
    resolve(__dirname, '../../prisma/schema.prisma'),
    'utf8',
  );
  const migration = readFileSync(
    resolve(
      __dirname,
      '../../prisma/migrations/20260726000000_init/migration.sql',
    ),
    'utf8',
  );

  it('uses MySQL and defines order lifecycle models', () => {
    expect(schema).toContain('provider = "mysql"');
    expect(schema).toContain('enum ReturnRequestType');
    expect(schema).toContain('enum ReturnRequestStatus');
    expect(schema).toContain('model OrderStatusHistory');
    expect(schema).toContain('model ReturnRequest');
    expect(schema).toContain('completedAt');
    expect(schema).toContain('cancelledAt');
    expect(schema).toContain('cancelReason');
  });

  it('enforces one active return request per order', () => {
    expect(schema).toMatch(/activeOrderId\s+Int\?\s+@unique/);
    expect(migration).toContain('`activeOrderId` INTEGER NULL');
    expect(migration).toContain(
      'UNIQUE INDEX `return_requests_activeOrderId_key`(`activeOrderId`)',
    );
  });

  it('matches database text columns to accepted DTO lengths', () => {
    expect(schema).toMatch(/address\s+String\?\s+@db\.VarChar\(500\)/);
    expect(schema).toMatch(/address\s+String\s+@db\.VarChar\(500\)/);
    expect(schema).toMatch(/note\s+String\?\s+@db\.VarChar\(1000\)/);
    expect(migration).toContain('`address` VARCHAR(500) NULL');
    expect(migration).toContain('`address` VARCHAR(500) NOT NULL');
    expect(migration).toContain('`note` VARCHAR(1000) NULL');
  });
});
