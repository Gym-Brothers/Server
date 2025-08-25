import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GoalType } from '../models/enums';
import { User } from './user.entity';

@Entity('fitness_goals')
export class FitnessGoals {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: GoalType,
    name: 'goal_type'
  })
  goalType: GoalType;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'target_weight' })
  targetWeight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'target_body_fat' })
  targetBodyFat: number;

  @Column({ type: 'date', nullable: true, name: 'target_date' })
  targetDate: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.fitnessGoals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
