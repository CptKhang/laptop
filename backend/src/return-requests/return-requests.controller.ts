import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { ReturnRequestQueryDto } from './dto/return-request-query.dto';
import { ReturnRequestsService } from './return-requests.service';

@Controller('return-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnRequestsController {
  constructor(private readonly service: ReturnRequestsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateReturnRequestDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get()
  findMine(@Request() req, @Query() query: ReturnRequestQueryDto) {
    return this.service.findMine(req.user.id, query);
  }

  @Get(':id')
  findMineById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.findMineById(id, req.user.id);
  }
}
