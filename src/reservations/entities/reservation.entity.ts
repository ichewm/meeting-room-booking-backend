import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MeetingRoom } from '../../meeting-rooms/entities/meeting-room.entity';

@Entity('reservations')
@Index(['startTime', 'endTime']) // 为时间范围查询优化
@Index(['userId']) // 为用户查询优化
@Index(['roomId']) // 为会议室查询优化
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '预订标题' })
  title: string;

  @Column({ nullable: true, comment: '预订描述' })
  description: string;

  @Column({
    type: 'datetime',
    comment: '开始时间',
  })
  startTime: Date;

  @Column({
    type: 'datetime',
    comment: '结束时间',
  })
  endTime: Date;

  @Column({ comment: '用户 ID' })
  userId: number;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ comment: '会议室 ID' })
  roomId: number;

  @ManyToOne(() => MeetingRoom, (room) => room.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roomId' })
  room: MeetingRoom;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
