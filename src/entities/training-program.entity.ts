import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Coach } from './coach.entity';
import { User } from './user.entity';
import { TrainingDay } from './training-day.entity';
import { Media } from './media.entity';
import { WorkoutSession } from './workout-session.entity';

export enum ProgramDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum ProgramType {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  REHABILITATION = 'rehabilitation',
  GENERAL_FITNESS = 'general_fitness'
}

@Entity('training_programs')
export class TrainingProgram {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'coach_id' })
  coachId: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ProgramDifficulty,
  })
  difficulty: ProgramDifficulty;

  @Column({
    type: 'enum',
    enum: ProgramType,
  })
  type: ProgramType;

  @Column({ name: 'duration_weeks' })
  durationWeeks: number;

  @Column({ name: 'days_per_week' })
  daysPerWeek: number;

  @Column({ name: 'estimated_duration_minutes' })
  estimatedDurationMinutes: number;

  @Column({ type: 'json', name: 'equipment_needed' })
  equipmentNeeded: string[];

  @Column({ type: 'json', name: 'target_muscles' })
  targetMuscles: string[];

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, name: 'rating' })
  rating: number;

  @Column({ default: 0, name: 'total_ratings' })
  totalRatings: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  price: number;

  @Column({ default: 'USD', nullable: true })
  currency: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Coach, coach => coach.trainingPrograms)
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;

  @ManyToOne(() => User, user => user.trainingPrograms, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  assignedUser: User;

  @OneToMany(() => TrainingDay, trainingDay => trainingDay.program, { cascade: true })
  trainingDays: TrainingDay[];

  @OneToMany(() => Media, media => media.trainingProgram)
  media: Media[];

  @OneToMany(() => WorkoutSession, session => session.trainingProgram)
  workoutSessions: WorkoutSession[];
}
