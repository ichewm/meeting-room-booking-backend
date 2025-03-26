import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { MeetingRoom } from 'src/meeting-rooms/entities/meeting-room.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Reservation, MeetingRoom])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
