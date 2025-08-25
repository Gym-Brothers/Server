import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Coach } from './coach.entity';
import { Exercise } from './exercise.entity';
import { TrainingProgram } from './training-program.entity';

export enum MediaType {
  VIDEO = 'video',
  IMAGE = 'image',
  AUDIO = 'audio',
  DOCUMENT = 'document'
}

export enum MediaCategory {
  EXERCISE_DEMO = 'exercise_demo',
  FORM_CHECK = 'form_check',
  PROGRESS_PHOTO = 'progress_photo',
  WORKOUT_INSTRUCTION = 'workout_instruction',
  NUTRITION_GUIDE = 'nutrition_guide',
  EDUCATIONAL = 'educational'
}

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'coach_id' })
  coachId: number;

  @Column({ name: 'exercise_id', nullable: true })
  exerciseId: number;

  @Column({ name: 'training_program_id', nullable: true })
  trainingProgramId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type: MediaType;

  @Column({
    type: 'enum',
    enum: MediaCategory,
  })
  category: MediaCategory;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 's3_key' })
  s3Key: string;

  @Column({ name: 's3_bucket' })
  s3Bucket: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'duration_seconds', nullable: true })
  durationSeconds: number;

  @Column({ name: 'thumbnail_s3_key', nullable: true })
  thumbnailS3Key: string;

  @Column({ name: 'public_url' })
  publicUrl: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Coach, coach => coach.media)
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;

  @ManyToOne(() => Exercise, exercise => exercise.media, { nullable: true })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @ManyToOne(() => TrainingProgram, program => program.media, { nullable: true })
  @JoinColumn({ name: 'training_program_id' })
  trainingProgram: TrainingProgram;
}
