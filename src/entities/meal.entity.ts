import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { NutritionDay } from './nutrition-day.entity';
import { FoodItem } from './food-item.entity';

export enum MealType {
  BREAKFAST = 'breakfast',
  MORNING_SNACK = 'morning_snack',
  LUNCH = 'lunch',
  AFTERNOON_SNACK = 'afternoon_snack',
  DINNER = 'dinner',
  EVENING_SNACK = 'evening_snack',
  PRE_WORKOUT = 'pre_workout',
  POST_WORKOUT = 'post_workout'
}

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nutrition_day_id' })
  nutritionDayId: number;

  @Column({
    type: 'enum',
    enum: MealType,
  })
  type: MealType;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'time', name: 'suggested_time' })
  suggestedTime: string;

  @Column({ type: 'int', name: 'preparation_time_minutes' })
  preparationTimeMinutes: number;

  @Column({ type: 'decimal', precision: 7, scale: 2 })
  calories: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  protein: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  carbs: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  fat: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  fiber: number;

  @Column({ type: 'text', name: 'cooking_instructions', nullable: true })
  cookingInstructions: string;

  @Column({ type: 'json', name: 'cooking_tips', nullable: true })
  cookingTips: string[];

  @Column({ type: 'json', name: 'substitutions', nullable: true })
  substitutions: { original: string; substitute: string; reason: string }[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => NutritionDay, day => day.meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nutrition_day_id' })
  nutritionDay: NutritionDay;

  @OneToMany(() => FoodItem, foodItem => foodItem.meal, { cascade: true })
  foodItems: FoodItem[];
}
