import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Request } from 'express';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @Req() req: Request,
  ) {
    const userId = req.user['id'];
    return this.reservationsService.create(createReservationDto, userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin) // 仅管理员和超级管理员可查看所有预订
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('user')
  async getUserReservations(@Req() req: Request) {
    const userId = req.user['id'];
    return this.reservationsService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
    @Req() req: Request,
  ) {
    const userId = req.user['id'];
    return this.reservationsService.update(id, updateReservationDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = req.user['id'];
    return this.reservationsService.remove(id, userId);
  }
}
