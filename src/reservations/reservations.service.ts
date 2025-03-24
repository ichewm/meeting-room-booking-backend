import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: number) {
    const startTime = new Date(createReservationDto.startTime);
    const endTime = new Date(createReservationDto.endTime);
    const currentTime = new Date();

    // Validation 1: Check if end time is not before current time
    if (endTime <= currentTime) {
      throw new BadRequestException(
        'The reservation end time cannot be earlier than the current time',
      );
    }

    // Validation 2: Check if start time is before end time
    if (startTime >= endTime) {
      throw new BadRequestException(
        'The reservation start time must be before the end time',
      );
    }

    // Validation 4: Check for overlapping reservations
    await this.checkForOverlappingReservations(
      createReservationDto.roomId,
      startTime,
      endTime,
    );

    const reservation = this.reservationsRepository.create({
      ...createReservationDto,
      userId,
      startTime,
      endTime,
    });
    return this.reservationsRepository.save(reservation);
  }

  private async checkForOverlappingReservations(
    roomId: number,
    startTime: Date,
    endTime: Date,
    excludeReservationId?: number,
  ) {
    // Find any reservations that overlap with the requested time period
    const queryBuilder = this.reservationsRepository
      .createQueryBuilder('reservation')
      .where('reservation.roomId = :roomId', { roomId })
      .andWhere(
        '(reservation.startTime < :endTime AND reservation.endTime > :startTime)',
        { startTime, endTime },
      );

    // Exclude the current reservation if updating
    if (excludeReservationId) {
      queryBuilder.andWhere('reservation.id != :id', {
        id: excludeReservationId,
      });
    }

    const overlappingReservations = await queryBuilder.getMany();

    if (overlappingReservations.length > 0) {
      throw new ConflictException(
        'The room is already reserved for the selected time period',
      );
    }
  }

  findAll() {
    return this.reservationsRepository.find({
      relations: ['room', 'user'],
      order: {
        startTime: 'DESC',
      },
    });
  }

  async findByUserId(userId: number) {
    // Find all reservations for a specific user
    const reservations = await this.reservationsRepository.find({
      where: { userId },
      relations: ['room'], // Include room details
      order: {
        startTime: 'DESC', // Order by start time descending (newest first)
      },
    });

    return reservations;
  }

  async findOne(id: number) {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
      relations: ['room', 'user'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async update(
    id: number,
    updateReservationDto: UpdateReservationDto,
    userId: number,
  ) {
    const reservation = await this.findOne(id);

    // Check if the reservation belongs to the user
    if (reservation.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this reservation',
      );
    }

    // If updating times or room, perform validations
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

      // Validation 1: Check if end time is not before current time
      if (endTime <= currentTime) {
        throw new BadRequestException(
          'The reservation end time cannot be earlier than the current time',
        );
      }

      // Validation 2: Check if start time is before end time
      if (startTime >= endTime) {
        throw new BadRequestException(
          'The reservation start time must be before the end time',
        );
      }

      // Validation 4: Check for overlapping reservations (excluding current reservation)
      await this.checkForOverlappingReservations(
        roomId,
        startTime,
        endTime,
        id,
      );
    }

    Object.assign(reservation, updateReservationDto);
    return this.reservationsRepository.save(reservation);
  }

  async remove(id: number, userId: number) {
    const reservation = await this.findOne(id);

    // Check if the reservation belongs to the user
    if (reservation.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this reservation',
      );
    }

    return this.reservationsRepository.remove(reservation);
  }
}
