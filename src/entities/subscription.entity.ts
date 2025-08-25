import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SubscriptionStatus, SubscriptionType } from '../models/enums';
import { User } from './user.entity';
import { Coach } from './coach.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'coach_id' })
  coachId: number;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
  })
  type: SubscriptionType;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING
  })
  status: SubscriptionStatus;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'monthly_price' })
  monthlyPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;

  @Column({ default: 'USD' })
  currency: string;

  // Features
  @Column({ name: 'personal_training_sessions' })
  personalTrainingSessions: number;

  @Column({ name: 'group_sessions' })
  groupSessions: number;

  @Column({ name: 'nutrition_planning', default: false })
  nutritionPlanning: boolean;

  @Column({ name: 'progress_tracking', default: true })
  progressTracking: boolean;

  @Column({ name: 'custom_workouts', default: false })
  customWorkouts: boolean;

  // Payment Information
  @Column({ nullable: true, name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'timestamp', nullable: true, name: 'last_payment_date' })
  lastPaymentDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'next_payment_date' })
  nextPaymentDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'cancelled_at' })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true, name: 'cancellation_reason' })
  cancellationReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Coach, coach => coach.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;
}
