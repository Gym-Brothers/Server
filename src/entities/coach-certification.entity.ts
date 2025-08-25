import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Coach } from './coach.entity';

@Entity('coach_certifications')
export class CoachCertification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'coach_id' })
  coachId: number;

  @Column()
  name: string;

  @Column({ name: 'issuing_organization' })
  issuingOrganization: string;

  @Column({ type: 'date', name: 'issue_date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true, name: 'expiry_date' })
  expiryDate: Date;

  @Column({ nullable: true, name: 'certificate_number' })
  certificateNumber: string;

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Coach, coach => coach.certifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;
}
