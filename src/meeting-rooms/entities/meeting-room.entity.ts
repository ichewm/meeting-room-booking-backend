import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';

// Meeting room status enum
export enum MeetingRoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
}

@Entity()
export class MeetingRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  capacity: number;

  @Column()
  location: string;

  @Column({ nullable: true })
  description: string;

  // Status field to represent the current state of the meeting room
  @Column({
    type: 'enum',
    enum: MeetingRoomStatus,
    default: MeetingRoomStatus.AVAILABLE,
  })
  status: MeetingRoomStatus;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // A room can have multiple reservations
  @OneToMany(() => Reservation, (reservation) => reservation.room)
  reservations: Reservation[];
}
