import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { Role } from "@prisma/client";

@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.id, req.user.role);
  }

  @Get(":id")
  findOne(@Request() req, @Param("id") id: string) {
    return this.ordersService.findOne(+id, req.user.id, req.user.role);
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN)
  updateStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.ordersService.updateStatus(+id, dto);
  }
}
