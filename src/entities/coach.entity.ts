import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { CoachCertification } from './coach-certification.entity';
import { CoachSpecialization } from './coach-specialization.entity';
import { Subscription } from './subscription.entity';

@Entity('coaches')
export class Coach {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({ type: 'text' })
  bio: string;

  @Column({ name: 'years_of_experience' })
  yearsOfExperience: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'hourly_rate' })
  hourlyRate: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, name: 'average_rating' })
  averageRating: number;

  @Column({ default: 0, name: 'total_reviews' })
  totalReviews: number;

  @Column({ name: 'max_clients' })
  maxClients: number;

  @Column({ default: 0, name: 'current_client_count' })
  currentClientCount: number;

  @Column({ default: true, name: 'is_available' })
  isAvailable: boolean;

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'verification_date' })
  verificationDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToOne(() => User, user => user.coach, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => CoachCertification, certification => certification.coach)
  certifications: CoachCertification[];

  @OneToMany(() => CoachSpecialization, specialization => specialization.coach)
  specializations: CoachSpecialization[];

  @OneToMany(() => Subscription, subscription => subscription.coach)
  subscriptions: Subscription[];
}
