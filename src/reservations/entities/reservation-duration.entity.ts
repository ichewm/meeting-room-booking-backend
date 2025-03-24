import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ReservationDuration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  durationMinutes: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
