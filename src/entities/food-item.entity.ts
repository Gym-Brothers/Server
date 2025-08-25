import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Meal } from './meal.entity';

@Entity('food_items')
export class FoodItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'meal_id' })
  mealId: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 8, scale: 3 })
  quantity: number;

  @Column({ length: 50 })
  unit: string; // grams, cups, pieces, etc.

  @Column({ type: 'decimal', precision: 7, scale: 2, name: 'calories_per_unit' })
  caloriesPerUnit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'protein_per_unit' })
  proteinPerUnit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'carbs_per_unit' })
  carbsPerUnit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'fat_per_unit' })
  fatPerUnit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'fiber_per_unit' })
  fiberPerUnit: number;

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

  @Column({ type: 'json', name: 'vitamins_minerals', nullable: true })
  vitaminsMinerals: { name: string; amount: number; unit: string }[];

  @Column({ length: 100, nullable: true })
  brand: string;

  @Column({ type: 'text', name: 'preparation_notes', nullable: true })
  preparationNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Meal, meal => meal.foodItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meal_id' })
  meal: Meal;
}
