import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingRoom, MeetingRoomStatus } from './entities/meeting-room.entity';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class MeetingRoomsService {
  private readonly logger = new Logger(MeetingRoomsService.name);

  constructor(
    @InjectRepository(MeetingRoom)
    private meetingRoomRepository: Repository<MeetingRoom>,
  ) {}

  async create(
    createMeetingRoomDto: CreateMeetingRoomDto,
  ): Promise<MeetingRoom> {
    const existingRoom = await this.meetingRoomRepository.findOneBy({
      name: createMeetingRoomDto.name,
    });
    if (existingRoom) {
      throw new BadRequestException(
        `会议室名称 ${createMeetingRoomDto.name} 已存在`,
      );
    }

    const newRoom = this.meetingRoomRepository.create(createMeetingRoomDto);
    const savedRoom = await this.meetingRoomRepository.save(newRoom);
    this.logger.log(`创建会议室 ${savedRoom.name} 成功，ID: ${savedRoom.id}`);
    return savedRoom;
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    status?: MeetingRoomStatus;
  }): Promise<PaginatedResponse<MeetingRoom>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const status = query?.status;

    const queryBuilder = this.meetingRoomRepository
      .createQueryBuilder('room')
      .where('room.isActive = :isActive', { isActive: true });

    if (status) {
      queryBuilder.andWhere('room.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    queryBuilder.skip((page - 1) * limit).take(limit);
    const items = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);
    return {
      items,
      meta: { total, page, limit, totalPages },
    };
  }

  async findOne(id: number): Promise<MeetingRoom> {
    const room = await this.meetingRoomRepository.findOne({
      where: { id, isActive: true },
      relations: ['reservations'],
    });
    if (!room) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的会议室`);
    }
    return room;
  }

  async update(
    id: number,
    updateMeetingRoomDto: UpdateMeetingRoomDto,
  ): Promise<MeetingRoom> {
    const room = await this.findOne(id);
    if (updateMeetingRoomDto.name && updateMeetingRoomDto.name !== room.name) {
      const existingRoom = await this.meetingRoomRepository.findOneBy({
        name: updateMeetingRoomDto.name,
      });
      if (existingRoom) {
        throw new BadRequestException(
          `会议室名称 ${updateMeetingRoomDto.name} 已存在`,
        );
      }
    }

    Object.assign(room, updateMeetingRoomDto);
    const updatedRoom = await this.meetingRoomRepository.save(room);
    this.logger.log(`更新会议室 ${updatedRoom.name} 成功，ID: ${id}`);
    return updatedRoom;
  }

  async remove(id: number): Promise<void> {
    const room = await this.findOne(id);
    room.isActive = false;
    await this.meetingRoomRepository.save(room);
    this.logger.log(`删除会议室 ${room.name} 成功，ID: ${id}`);
  }

  async findAvailableRooms(
    startTime: Date,
    endTime: Date,
    capacity?: number,
  ): Promise<MeetingRoom[]> {
    const query = this.meetingRoomRepository
      .createQueryBuilder('room')
      .where('room.isActive = :isActive', { isActive: true })
      .andWhere('room.status = :status', {
        status: MeetingRoomStatus.AVAILABLE,
      });

    if (capacity !== undefined) {
      query.andWhere('room.capacity >= :capacity', { capacity });
    }

    query.leftJoin('room.reservations', 'reservation').andWhere(
      `
        (reservation.id IS NULL) OR 
        (NOT (
          (reservation.startTime <= :endTime) AND 
          (reservation.endTime >= :startTime)
        ))
      `,
      { startTime, endTime },
    );

    return query.getMany();
  }

  async updateStatus(
    id: number,
    status: MeetingRoomStatus,
  ): Promise<MeetingRoom> {
    const room = await this.findOne(id);
    room.status = status;
    const updatedRoom = await this.meetingRoomRepository.save(room);
    this.logger.log(`更新会议室 ${room.name} 状态为 ${status}，ID: ${id}`);
    return updatedRoom;
  }
}
