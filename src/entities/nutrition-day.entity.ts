import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { NutritionPlan } from './nutrition-plan.entity';
import { Meal } from './meal.entity';

@Entity('nutrition_days')
export class NutritionDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nutrition_plan_id' })
  nutritionPlanId: number;

  @Column({ name: 'day_number' })
  dayNumber: number;

  @Column({ name: 'week_number' })
  weekNumber: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 7, scale: 2, name: 'total_calories' })
  totalCalories: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'total_protein' })
  totalProtein: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'total_carbs' })
  totalCarbs: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'total_fat' })
  totalFat: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'total_fiber' })
  totalFiber: number;

  @Column({ type: 'text', name: 'daily_tips', nullable: true })
  dailyTips: string;

  @Column({ type: 'json', name: 'hydration_schedule' })
  hydrationSchedule: { time: string; amount: number; type: string }[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => NutritionPlan, plan => plan.nutritionDays, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nutrition_plan_id' })
  nutritionPlan: NutritionPlan;

  @OneToMany(() => Meal, meal => meal.nutritionDay, { cascade: true })
  meals: Meal[];
}
