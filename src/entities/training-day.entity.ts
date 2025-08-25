import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TrainingProgram } from './training-program.entity';
import { Exercise } from './exercise.entity';

@Entity('training_days')
export class TrainingDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'program_id' })
  programId: number;

  @Column({ name: 'day_number' })
  dayNumber: number;

  @Column({ name: 'week_number' })
  weekNumber: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'rest_day', default: false })
  restDay: boolean;

  @Column({ name: 'estimated_duration_minutes' })
  estimatedDurationMinutes: number;

  @Column({ type: 'json', name: 'focus_areas' })
  focusAreas: string[];

  @Column({ type: 'text', name: 'warm_up_instructions', nullable: true })
  warmUpInstructions: string;

  @Column({ type: 'text', name: 'cool_down_instructions', nullable: true })
  coolDownInstructions: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TrainingProgram, program => program.trainingDays, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'program_id' })
  program: TrainingProgram;

  @OneToMany(() => Exercise, exercise => exercise.trainingDay, { cascade: true })
  exercises: Exercise[];
}
