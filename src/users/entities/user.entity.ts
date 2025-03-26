import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Exclude } from 'class-transformer';
import { Role } from '../../auth/enums/role.enum';

@Entity()
@Index(['username']) // 为常用查询字段添加索引
@Index(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: '用户名，唯一' })
  username: string;

  @Column({ comment: '密码，已加密存储' })
  @Exclude() // 防止序列化时泄露
  password: string;

  @Column({ unique: true, comment: '邮箱，唯一' })
  email: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Employee,
    comment: '用户角色',
  })
  role: Role;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}
