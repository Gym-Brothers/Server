import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum HealthAlertType {
  HEART_RATE_ANOMALY = 'heart_rate_anomaly',
  BLOOD_PRESSURE_HIGH = 'blood_pressure_high',
  OVERTRAINING = 'overtraining',
  INJURY_RISK = 'injury_risk',
  DEHYDRATION = 'dehydration',
  NUTRITION_DEFICIENCY = 'nutrition_deficiency',
  SLEEP_PATTERN = 'sleep_pattern',
  STRESS_LEVEL = 'stress_level'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

@Entity('health_alerts')
export class HealthAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: HealthAlertType
  })
  type: HealthAlertType;

  @Column({
    type: 'enum',
    enum: AlertSeverity
  })
  severity: AlertSeverity;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', name: 'health_data' })
  healthData: {
    metric: string;
    value: number;
    normalRange: { min: number; max: number };
    unit: string;
  };

  @Column({ type: 'json', name: 'recommendations' })
  recommendations: string[];

  @Column({ name: 'requires_medical_attention', default: false })
  requiresMedicalAttention: boolean;

  @Column({ name: 'coach_notified', default: false })
  coachNotified: boolean;

  @Column({ name: 'is_resolved', default: false })
  isResolved: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'resolved_at' })
  resolvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.healthAlerts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
