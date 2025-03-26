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
  BadRequestException,
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
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('status') status?: MeetingRoomStatus,
  ) {
    if (page < 1) throw new BadRequestException('页码必须大于等于1');
    if (limit < 1) throw new BadRequestException('每页数量必须大于等于1');
    return this.meetingRoomsService.findAll({ page, limit, status });
  }

  @Roles(Role.Admin, Role.Employee)
  @Get('available')
  findAvailable(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('capacity', new ParseIntPipe({ optional: true })) capacity?: number,
  ) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('开始时间或结束时间格式无效');
    }
    if (end <= start) {
      throw new BadRequestException('结束时间必须晚于开始时间');
    }

    return this.meetingRoomsService.findAvailableRooms(start, end, capacity);
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
    if (!Object.values(MeetingRoomStatus).includes(status)) {
      throw new BadRequestException('无效的状态值');
    }
    return this.meetingRoomsService.updateStatus(id, status);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.meetingRoomsService.remove(id);
  }
}
