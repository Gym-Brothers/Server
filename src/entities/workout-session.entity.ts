import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { TrainingProgram } from './training-program.entity';
import { ExercisePerformance } from './exercise-performance.entity';

export enum WorkoutStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled'
}

@Entity('workout_sessions')
export class WorkoutSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'training_program_id' })
  trainingProgramId: number;

  @Column({ name: 'training_day_id' })
  trainingDayId: number;

  @Column({
    type: 'enum',
    enum: WorkoutStatus,
    default: WorkoutStatus.PLANNED
  })
  status: WorkoutStatus;

  @Column({ type: 'timestamp', name: 'scheduled_date' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', name: 'duration_minutes', nullable: true })
  durationMinutes: number;

  @Column({ type: 'int', name: 'calories_burned', nullable: true })
  caloriesBurned: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, name: 'difficulty_rating', nullable: true })
  difficultyRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, name: 'satisfaction_rating', nullable: true })
  satisfactionRating: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', name: 'heart_rate_data', nullable: true })
  heartRateData: { time: string; bpm: number }[];

  @Column({ name: 'is_rest_day', default: false })
  isRestDay: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.workoutSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TrainingProgram, program => program.workoutSessions)
  @JoinColumn({ name: 'training_program_id' })
  trainingProgram: TrainingProgram;

  @OneToMany(() => ExercisePerformance, performance => performance.workoutSession, { cascade: true })
  exercisePerformances: ExercisePerformance[];
}
