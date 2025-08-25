import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TrainingDay } from './training-day.entity';
import { Media } from './media.entity';
import { ExercisePerformance } from './exercise-performance.entity';

export enum ExerciseType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
  PLYOMETRIC = 'plyometric',
  ISOMETRIC = 'isometric'
}

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'training_day_id' })
  trainingDayId: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ExerciseType,
  })
  type: ExerciseType;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ nullable: true })
  sets: number;

  @Column({ nullable: true })
  reps: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'weight_kg' })
  weightKg: number;

  @Column({ type: 'int', nullable: true, name: 'duration_seconds' })
  durationSeconds: number;

  @Column({ type: 'int', nullable: true, name: 'rest_seconds' })
  restSeconds: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'distance_meters' })
  distanceMeters: number;

  @Column({ type: 'json', name: 'target_muscles' })
  targetMuscles: string[];

  @Column({ type: 'json', name: 'equipment_needed' })
  equipmentNeeded: string[];

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'text', name: 'safety_tips', nullable: true })
  safetyTips: string;

  @Column({ type: 'text', name: 'common_mistakes', nullable: true })
  commonMistakes: string;

  @Column({ type: 'json', name: 'modifications', nullable: true })
  modifications: { difficulty: string; description: string }[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TrainingDay, trainingDay => trainingDay.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'training_day_id' })
  trainingDay: TrainingDay;

  @OneToMany(() => Media, media => media.exercise)
  media: Media[];

  @OneToMany(() => ExercisePerformance, performance => performance.exercise)
  performances: ExercisePerformance[];
}
