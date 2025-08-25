import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WorkoutSession } from './workout-session.entity';
import { Exercise } from './exercise.entity';

@Entity('exercise_performances')
export class ExercisePerformance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'workout_session_id' })
  workoutSessionId: number;

  @Column({ name: 'exercise_id' })
  exerciseId: number;

  @Column({ name: 'set_number' })
  setNumber: number;

  @Column({ type: 'int', nullable: true })
  reps: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true, name: 'weight_kg' })
  weightKg: number;

  @Column({ type: 'int', nullable: true, name: 'duration_seconds' })
  durationSeconds: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, name: 'distance_meters' })
  distanceMeters: number;

  @Column({ type: 'int', nullable: true, name: 'rest_seconds' })
  restSeconds: number;

  @Column({ type: 'int', nullable: true, name: 'calories_burned' })
  caloriesBurned: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true, name: 'rpe_scale' })
  rpeScale: number; // Rate of Perceived Exertion (1-10)

  @Column({ type: 'json', nullable: true, name: 'form_feedback' })
  formFeedback: {
    aiScore: number; // 0-100
    suggestions: string[];
    videoAnalysis?: string;
  };

  @Column({ name: 'is_personal_record', default: false })
  isPersonalRecord: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => WorkoutSession, session => session.exercisePerformances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workout_session_id' })
  workoutSession: WorkoutSession;

  @ManyToOne(() => Exercise, exercise => exercise.performances)
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;
}
