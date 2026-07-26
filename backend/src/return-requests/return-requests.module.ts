import { Module } from '@nestjs/common';
import { AdminReturnRequestsController } from './admin-return-requests.controller';
import { ReturnRequestsController } from './return-requests.controller';
import { ReturnRequestsService } from './return-requests.service';

@Module({
  controllers: [ReturnRequestsController, AdminReturnRequestsController],
  providers: [ReturnRequestsService],
})
export class ReturnRequestsModule {}
