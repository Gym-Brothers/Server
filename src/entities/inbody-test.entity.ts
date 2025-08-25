import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { NutritionPlan } from './nutrition-plan.entity';

@Entity('inbody_tests')
export class InBodyTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  // Basic Measurements
  @Column({ type: 'decimal', precision: 5, scale: 2, comment: 'Weight in kg' })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: 'Height in cm' })
  height: number;

  // Body Composition Analysis
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'skeletal_muscle_mass', comment: 'Skeletal muscle mass in kg' })
  skeletalMuscleMass: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'body_fat_mass', comment: 'Body fat mass in kg' })
  bodyFatMass: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'body_fat_percentage', comment: 'Body fat percentage' })
  bodyFatPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'total_body_water', comment: 'Total body water in liters' })
  totalBodyWater: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'protein_mass', comment: 'Protein mass in kg' })
  proteinMass: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'mineral_mass', comment: 'Mineral mass in kg' })
  mineralMass: number;

  // Advanced Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'visceral_fat_level', comment: 'Visceral fat level (1-20)' })
  visceralFatLevel: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'basal_metabolic_rate', comment: 'BMR in kcal' })
  basalMetabolicRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'lean_body_mass', comment: 'Lean body mass in kg' })
  leanBodyMass: number;

  // Segmental Analysis
  @Column({ type: 'json', name: 'arm_muscle_mass', comment: 'Left and right arm muscle mass' })
  armMuscleMass: { left: number; right: number };

  @Column({ type: 'json', name: 'leg_muscle_mass', comment: 'Left and right leg muscle mass' })
  legMuscleMass: { left: number; right: number };

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'trunk_muscle_mass', comment: 'Trunk muscle mass in kg' })
  trunkMuscleMass: number;

  // Body Score and Analysis
  @Column({ type: 'int', name: 'body_score', comment: 'Overall body score (0-100)' })
  bodyScore: number;

  @Column({ type: 'varchar', length: 50, name: 'body_type', comment: 'Body type classification' })
  bodyType: string;

  // Test Information
  @Column({ type: 'timestamp', name: 'test_date' })
  testDate: Date;

  @Column({ type: 'varchar', length: 100, name: 'test_location', nullable: true })
  testLocation: string;

  @Column({ type: 'varchar', length: 100, name: 'technician_name', nullable: true })
  technicianName: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.inBodyTests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => NutritionPlan, plan => plan.inbodyTest)
  nutritionPlans: NutritionPlan[];
}
