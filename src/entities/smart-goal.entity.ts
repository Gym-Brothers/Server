import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum GoalType {
  WEIGHT_LOSS = 'weight_loss',
  WEIGHT_GAIN = 'weight_gain',
  MUSCLE_GAIN = 'muscle_gain',
  STRENGTH_INCREASE = 'strength_increase',
  ENDURANCE_IMPROVEMENT = 'endurance_improvement',
  BODY_FAT_REDUCTION = 'body_fat_reduction',
  FLEXIBILITY_IMPROVEMENT = 'flexibility_improvement',
  HABIT_FORMATION = 'habit_formation'
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

@Entity('smart_goals')
export class SmartGoal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: GoalType
  })
  type: GoalType;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'target_value' })
  targetValue: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'current_value', default: 0 })
  currentValue: number;

  @Column({ length: 20 })
  unit: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'target_date' })
  targetDate: Date;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.ACTIVE
  })
  status: GoalStatus;

  @Column({ type: 'json', name: 'milestones' })
  milestones: {
    percentage: number;
    value: number;
    achieved: boolean;
    achievedDate?: Date;
    reward?: string;
  }[];

  @Column({ type: 'json', name: 'ai_insights' })
  aiInsights: {
    probabilityOfSuccess: number;
    suggestedAdjustments: string[];
    motivationalMessage: string;
    weeklyProgress: number;
  };

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.smartGoals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
