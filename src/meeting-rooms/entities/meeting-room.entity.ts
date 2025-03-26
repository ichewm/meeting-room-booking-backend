import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';

export enum MeetingRoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
}

@Entity()
@Unique(['name']) // 确保名称唯一
export class MeetingRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '会议室名称' })
  name: string;

  @Column({ comment: '会议室容量' })
  capacity: number;

  @Column({ comment: '会议室位置' })
  location: string;

  @Column({ nullable: true, comment: '会议室描述' })
  description: string;

  @Column({
    type: 'enum',
    enum: MeetingRoomStatus,
    default: MeetingRoomStatus.AVAILABLE,
    comment: '会议室状态',
  })
  @Index() // 为状态字段添加索引
  status: MeetingRoomStatus;

  @Column({ default: true, comment: '是否激活' })
  @Index() // 为激活状态添加索引
  isActive: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.room)
  reservations: Reservation[];
}
