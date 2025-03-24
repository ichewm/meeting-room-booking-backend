import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MeetingRoomsService } from './meeting-rooms.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { MeetingRoomStatus } from './entities/meeting-room.entity';

@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeetingRoomsController {
  constructor(private readonly meetingRoomsService: MeetingRoomsService) {}

  @Roles(Role.Admin)
  @Post()
  create(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return this.meetingRoomsService.create(createMeetingRoomDto);
  }

  @Roles(Role.Admin, Role.Employee)
  @Get()
  findAll(
    @Query('page') pageString?: string,
    @Query('limit') limitString?: string,
    @Query('status') status?: MeetingRoomStatus,
  ) {
    // Parse page and limit to integers
    const page = pageString ? parseInt(pageString, 10) : undefined;
    const limit = limitString ? parseInt(limitString, 10) : undefined;

    // Validate that page and limit are positive numbers if provided
    if (page !== undefined && (isNaN(page) || page < 1)) {
      throw new Error('Page must be a positive number');
    }

    if (limit !== undefined && (isNaN(limit) || limit < 1)) {
      throw new Error('Limit must be a positive number');
    }

    return this.meetingRoomsService.findAll({ page, limit, status });
  }

  @Roles(Role.Admin, Role.Employee)
  @Get('available')
  findAvailable(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('capacity') capacityString?: string,
  ) {
    // Parse capacity to integer if provided
    const capacity = capacityString ? parseInt(capacityString, 10) : undefined;

    return this.meetingRoomsService.findAvailableRooms(
      new Date(startTime),
      new Date(endTime),
      capacity,
    );
  }

  @Roles(Role.Admin, Role.Employee)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.meetingRoomsService.findOne(id);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMeetingRoomDto: UpdateMeetingRoomDto,
  ) {
    return this.meetingRoomsService.update(id, updateMeetingRoomDto);
  }

  @Roles(Role.Admin)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: MeetingRoomStatus,
  ) {
    return this.meetingRoomsService.updateStatus(id, status);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.meetingRoomsService.remove(id);
  }
}
