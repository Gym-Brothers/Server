import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { BloodType } from '../models/enums';
import { User } from './user.entity';

@Entity('medical_history')
export class MedicalHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({
    type: 'enum',
    enum: BloodType,
    nullable: true,
    name: 'blood_type'
  })
  bloodType: BloodType;

  @Column({ type: 'text', array: true, default: '{}' })
  allergies: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  medications: string[];

  @Column({ type: 'text', array: true, default: '{}', name: 'chronic_conditions' })
  chronicConditions: string[];

  @Column({ type: 'text', array: true, default: '{}', name: 'past_surgeries' })
  pastSurgeries: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  injuries: string[];

  @Column({ nullable: true, name: 'physician_name' })
  physicianName: string;

  @Column({ nullable: true, name: 'physician_contact' })
  physicianContact: string;

  @Column({ type: 'date', nullable: true, name: 'last_checkup_date' })
  lastCheckupDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, user => user.medicalHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
