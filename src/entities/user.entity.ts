import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Gender, ActivityLevel } from '../models/enums';
import { Address } from './address.entity';
import { EmergencyContact } from './emergency-contact.entity';
import { HealthMetrics } from './health-metrics.entity';
import { MedicalHistory } from './medical-history.entity';
import { FitnessGoals } from './fitness-goals.entity';
import { Coach } from './coach.entity';
import { Subscription } from './subscription.entity';
import { InBodyTest } from './inbody-test.entity';
import { TrainingProgram } from './training-program.entity';
import { NutritionPlan } from './nutrition-plan.entity';
import { WorkoutSession } from './workout-session.entity';
import { HealthAlert } from './health-alert.entity';
import { SmartGoal } from './smart-goal.entity';
import { WearableIntegration } from './wearable-integration.entity';
import { CoachingMessage } from './coaching-message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // Personal Information
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ type: 'date', name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'profile_picture', nullable: true })
  profilePicture: string;

  // Physical Information
  @Column({
    type: 'enum',
    enum: ActivityLevel,
    name: 'activity_level'
  })
  activityLevel: ActivityLevel;

  // System Information
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'phone_verified', default: false })
  phoneVerified: boolean;

  @Column({ type: 'timestamp', name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Address, address => address.user)
  addresses: Address[];

  @OneToMany(() => EmergencyContact, contact => contact.user)
  emergencyContacts: EmergencyContact[];

  @OneToMany(() => HealthMetrics, metrics => metrics.user)
  healthMetrics: HealthMetrics[];

  @OneToOne(() => MedicalHistory, history => history.user)
  medicalHistory: MedicalHistory;

  @OneToMany(() => FitnessGoals, goals => goals.user)
  fitnessGoals: FitnessGoals[];

  @OneToOne(() => Coach, coach => coach.user)
  coach: Coach;

  @OneToMany(() => Subscription, subscription => subscription.user)
  subscriptions: Subscription[];

  @OneToMany(() => InBodyTest, test => test.user)
  inBodyTests: InBodyTest[];

  @OneToMany(() => TrainingProgram, program => program.assignedUser)
  trainingPrograms: TrainingProgram[];

  @OneToMany(() => NutritionPlan, plan => plan.user)
  nutritionPlans: NutritionPlan[];

  @OneToMany(() => WorkoutSession, session => session.user)
  workoutSessions: WorkoutSession[];

  @OneToMany(() => HealthAlert, alert => alert.user)
  healthAlerts: HealthAlert[];

  @OneToMany(() => SmartGoal, goal => goal.user)
  smartGoals: SmartGoal[];

  @OneToMany(() => WearableIntegration, wearable => wearable.user)
  wearableIntegrations: WearableIntegration[];

  @OneToMany(() => CoachingMessage, message => message.sender)
  sentMessages: CoachingMessage[];

  @OneToMany(() => CoachingMessage, message => message.receiver)
  receivedMessages: CoachingMessage[];
}
