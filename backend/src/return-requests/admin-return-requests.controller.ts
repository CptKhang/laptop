import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReturnRequestQueryDto } from './dto/return-request-query.dto';
import { UpdateReturnRequestStatusDto } from './dto/update-return-request-status.dto';
import { ReturnRequestsService } from './return-requests.service';

@Controller('admin/return-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminReturnRequestsController {
  constructor(private readonly service: ReturnRequestsService) {}

  @Get()
  findAll(@Query() query: ReturnRequestQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneForAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReturnRequestStatusDto,
  ) {
    return this.service.updateStatus(id, dto, req.user.id);
  }
}
