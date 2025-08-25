import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('health_metrics')
export class HealthMetrics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: 'Height in cm' })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: 'Weight in kg' })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'body_fat_percentage' })
  bodyFatPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'muscle_mass', comment: 'Muscle mass in kg' })
  muscleMass: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: 'Calculated BMI' })
  bmi: number;

  @Column({ type: 'int', nullable: true, name: 'blood_pressure_systolic' })
  bloodPressureSystolic: number;

  @Column({ type: 'int', nullable: true, name: 'blood_pressure_diastolic' })
  bloodPressureDiastolic: number;

  @Column({ type: 'int', nullable: true, name: 'resting_heart_rate' })
  restingHeartRate: number;

  @Column({ type: 'int', nullable: true, name: 'max_heart_rate' })
  maxHeartRate: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', name: 'recorded_at', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.healthMetrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
