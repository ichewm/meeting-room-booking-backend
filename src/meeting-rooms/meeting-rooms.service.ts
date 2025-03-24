import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingRoom, MeetingRoomStatus } from './entities/meeting-room.entity';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';

// Define paginated response interface
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
  constructor(
    @InjectRepository(MeetingRoom)
    private meetingRoomRepository: Repository<MeetingRoom>,
  ) {}

  async create(
    createMeetingRoomDto: CreateMeetingRoomDto,
  ): Promise<MeetingRoom> {
    const newRoom = this.meetingRoomRepository.create(createMeetingRoomDto);
    return this.meetingRoomRepository.save(newRoom);
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    status?: MeetingRoomStatus;
  }): Promise<PaginatedResponse<MeetingRoom>> {
    // Ensure default values and type safety
    const page = query?.page && Number.isInteger(query.page) ? query.page : 1;
    const limit =
      query?.limit && Number.isInteger(query.limit) ? query.limit : 10;
    const status = query?.status;

    // Extra validation to ensure skip value will be a number
    if (isNaN(page) || page < 1) {
      throw new BadRequestException('Page must be a positive number');
    }

    if (isNaN(limit) || limit < 1) {
      throw new BadRequestException('Limit must be a positive number');
    }

    const queryBuilder = this.meetingRoomRepository
      .createQueryBuilder('room')
      .where('room.isActive = :isActive', { isActive: true });

    if (status) {
      queryBuilder.andWhere('room.status = :status', { status });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination with explicit number conversion
    const skipValue = (page - 1) * limit;
    queryBuilder.skip(skipValue).take(limit);

    // Get data
    const items = await queryBuilder.getMany();

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Return response with pagination metadata
    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number): Promise<MeetingRoom> {
    const room = await this.meetingRoomRepository.findOne({
      where: { id, isActive: true },
      relations: ['reservations'],
    });

    if (!room) {
      throw new NotFoundException(`Meeting room with ID ${id} not found`);
    }

    return room;
  }

  async update(
    id: number,
    updateMeetingRoomDto: UpdateMeetingRoomDto,
  ): Promise<MeetingRoom> {
    const room = await this.findOne(id);

    // Update the room properties
    Object.assign(room, updateMeetingRoomDto);

    return this.meetingRoomRepository.save(room);
  }

  async remove(id: number): Promise<void> {
    const room = await this.findOne(id);

    // Soft delete by setting isActive to false
    room.isActive = false;
    await this.meetingRoomRepository.save(room);
  }

  async findAvailableRooms(
    startTime: Date,
    endTime: Date,
    capacity?: number,
  ): Promise<MeetingRoom[]> {
    // Base query for active rooms
    const query = this.meetingRoomRepository
      .createQueryBuilder('room')
      .where('room.isActive = :isActive', { isActive: true })
      .andWhere('room.status = :status', {
        status: MeetingRoomStatus.AVAILABLE,
      });

    // Add capacity filter if provided
    if (capacity !== undefined) {
      // Ensure capacity is a number
      if (isNaN(capacity) || capacity < 0) {
        throw new BadRequestException('Capacity must be a non-negative number');
      }
      query.andWhere('room.capacity >= :capacity', { capacity });
    }

    // Add reservation check to find available rooms
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

  // Add method to update meeting room status
  async updateStatus(
    id: number,
    status: MeetingRoomStatus,
  ): Promise<MeetingRoom> {
    const room = await this.findOne(id);
    room.status = status;
    return this.meetingRoomRepository.save(room);
  }
}
