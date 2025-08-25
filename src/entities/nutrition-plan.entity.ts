import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Coach } from './coach.entity';
import { InBodyTest } from './inbody-test.entity';
import { NutritionDay } from './nutrition-day.entity';

export enum NutritionGoal {
  WEIGHT_LOSS = 'weight_loss',
  WEIGHT_GAIN = 'weight_gain',
  MUSCLE_GAIN = 'muscle_gain',
  MAINTENANCE = 'maintenance',
  CUTTING = 'cutting',
  BULKING = 'bulking'
}

export enum DietType {
  BALANCED = 'balanced',
  HIGH_PROTEIN = 'high_protein',
  LOW_CARB = 'low_carb',
  KETO = 'keto',
  MEDITERRANEAN = 'mediterranean',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  PALEO = 'paleo'
}

@Entity('nutrition_plans')
export class NutritionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'coach_id' })
  coachId: number;

  @Column({ name: 'inbody_test_id' })
  inbodyTestId: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: NutritionGoal,
  })
  goal: NutritionGoal;

  @Column({
    type: 'enum',
    enum: DietType,
  })
  dietType: DietType;

  @Column({ name: 'duration_weeks' })
  durationWeeks: number;

  // Calculated based on InBody test
  @Column({ type: 'decimal', precision: 7, scale: 2, name: 'daily_calories' })
  dailyCalories: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'protein_grams' })
  proteinGrams: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'carbs_grams' })
  carbsGrams: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'fat_grams' })
  fatGrams: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'fiber_grams' })
  fiberGrams: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'water_liters' })
  waterLiters: number;

  // Meal distribution
  @Column({ type: 'int', name: 'meals_per_day' })
  mealsPerDay: number;

  @Column({ type: 'json', name: 'meal_timing' })
  mealTiming: { meal: string; time: string; calories: number }[];

  // Supplements recommendations
  @Column({ type: 'json', name: 'supplements', nullable: true })
  supplements: { name: string; dosage: string; timing: string }[];

  // Allergies and preferences
  @Column({ type: 'json', name: 'allergies', nullable: true })
  allergies: string[];

  @Column({ type: 'json', name: 'food_preferences', nullable: true })
  foodPreferences: string[];

  @Column({ type: 'json', name: 'foods_to_avoid', nullable: true })
  foodsToAvoid: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.nutritionPlans)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Coach, coach => coach.nutritionPlans)
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;

  @ManyToOne(() => InBodyTest, inbodyTest => inbodyTest.nutritionPlans)
  @JoinColumn({ name: 'inbody_test_id' })
  inbodyTest: InBodyTest;

  @OneToMany(() => NutritionDay, nutritionDay => nutritionDay.nutritionPlan, { cascade: true })
  nutritionDays: NutritionDay[];
}
