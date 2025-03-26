import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import {
  MeetingRoom,
  MeetingRoomStatus,
} from '../meeting-rooms/entities/meeting-room.entity';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    @InjectRepository(MeetingRoom)
    private meetingRoomRepository: Repository<MeetingRoom>,
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: number) {
    const startTime = new Date(createReservationDto.startTime);
    const endTime = new Date(createReservationDto.endTime);
    const currentTime = new Date();

    if (endTime <= currentTime) {
      throw new BadRequestException('预订结束时间不能早于当前时间');
    }

    // 创建事务管理器
    const queryRunner =
      this.reservationsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 在事务中检查冲突
      await this.checkForOverlappingReservations(
        createReservationDto.roomId,
        startTime,
        endTime,
        queryRunner,
      );

      // 创建并保存预订
      const reservation = this.reservationsRepository.create({
        ...createReservationDto,
        userId,
        startTime,
        endTime,
      });

      const savedReservation = await queryRunner.manager.save(reservation);

      // 更新会议室状态
      const room = await queryRunner.manager.findOneOrFail(MeetingRoom, {
        where: { id: createReservationDto.roomId },
      });
      room.status = MeetingRoomStatus.OCCUPIED;
      await queryRunner.manager.save(room);
      // 提交事务
      await queryRunner.commitTransaction();
      this.logger.log(`用户 ${userId} 创建预订 ${savedReservation.id} 成功`);
      return savedReservation;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      this.logger.error(`创建预订失败: ${error.message}`, error.stack);
      throw error;
    } finally {
      // 释放事务资源
      await queryRunner.release();
    }
  }

  private async checkForOverlappingReservations(
    roomId: number,
    startTime: Date,
    endTime: Date,
    queryRunner: QueryRunner,
    excludeReservationId?: number,
  ) {
    const queryBuilder = queryRunner.manager
      .createQueryBuilder(Reservation, 'reservation')
      .where('reservation.roomId = :roomId', { roomId })
      .andWhere(
        '(reservation.startTime < :endTime AND reservation.endTime > :startTime)',
        { startTime, endTime },
      );

    if (excludeReservationId) {
      queryBuilder.andWhere('reservation.id != :id', {
        id: excludeReservationId,
      });
    }

    const overlappingReservations = await queryBuilder.getMany();
    if (overlappingReservations.length > 0) {
      throw new ConflictException('该时间段内会议室已被预订');
    }
  }

  async findAll() {
    return this.reservationsRepository.find({
      relations: ['room', 'user'],
      order: { startTime: 'DESC' },
    });
  }

  async findByUserId(userId: number) {
    return this.reservationsRepository.find({
      where: { userId },
      relations: ['room'],
      order: { startTime: 'DESC' },
    });
  }

  async findOne(id: number) {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
      relations: ['room', 'user'],
    });
    if (!reservation) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的预订`);
    }
    return reservation;
  }

  async update(
    id: number,
    updateReservationDto: UpdateReservationDto,
    userId: number,
  ) {
    const reservation = await this.findOne(id);
    if (reservation.userId !== userId) {
      throw new ForbiddenException('您无权更新此预订');
    }

    const queryRunner =
      this.reservationsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (
        updateReservationDto.startTime ||
        updateReservationDto.endTime ||
        updateReservationDto.roomId
      ) {
        const startTime = updateReservationDto.startTime
          ? new Date(updateReservationDto.startTime)
          : reservation.startTime;
        const endTime = updateReservationDto.endTime
          ? new Date(updateReservationDto.endTime)
          : reservation.endTime;
        const roomId = updateReservationDto.roomId || reservation.roomId;
        const currentTime = new Date();

        if (endTime <= currentTime) {
          throw new BadRequestException('预订结束时间不能早于当前时间');
        }

        await this.checkForOverlappingReservations(
          roomId,
          startTime,
          endTime,
          queryRunner,
          id,
        );
      }

      Object.assign(reservation, updateReservationDto);
      const updatedReservation = await queryRunner.manager.save(reservation);
      await queryRunner.commitTransaction();
      this.logger.log(`用户 ${userId} 更新预订 ${id} 成功`);
      return updatedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`更新预订 ${id} 失败: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number, userId: number) {
    const reservation = await this.findOne(id);
    if (reservation.userId !== userId) {
      throw new ForbiddenException('您无权删除此预订');
    }

    await this.reservationsRepository.remove(reservation);
    this.logger.log(`用户 ${userId} 删除预订 ${id} 成功`);
  }
}
