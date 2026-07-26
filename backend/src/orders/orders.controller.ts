import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req, @Query() query: OrderQueryDto) {
    return this.ordersService.findAll(req.user.id, req.user.role, query);
  }

  @Post(':id/cancel')
  cancel(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancel(id, req.user.id, dto);
  }

  @Get(':id/status-history')
  findStatusHistory(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findStatusHistory(id, req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto, req.user.id);
  }
}
