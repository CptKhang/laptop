import { ReturnRequestStatus } from '@prisma/client';

export const RETURN_REQUEST_TRANSITIONS: Readonly<
  Record<ReturnRequestStatus, readonly ReturnRequestStatus[]>
> = {
  [ReturnRequestStatus.PENDING]: [
    ReturnRequestStatus.APPROVED,
    ReturnRequestStatus.REJECTED,
  ],
  [ReturnRequestStatus.APPROVED]: [ReturnRequestStatus.COMPLETED],
  [ReturnRequestStatus.REJECTED]: [],
  [ReturnRequestStatus.COMPLETED]: [],
};
