import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionPlan, NutritionGoal, DietType } from '../entities/nutrition-plan.entity';
import { NutritionDay } from '../entities/nutrition-day.entity';
import { Meal, MealType } from '../entities/meal.entity';
import { FoodItem } from '../entities/food-item.entity';
import { InBodyTest } from '../entities/inbody-test.entity';
import { User } from '../entities/user.entity';
import { InBodyService } from './inbody.service';

interface MealPlanTemplate {
  breakfast: { calories: number; protein: number; carbs: number; fat: number };
  morningSnack: { calories: number; protein: number; carbs: number; fat: number };
  lunch: { calories: number; protein: number; carbs: number; fat: number };
  afternoonSnack: { calories: number; protein: number; carbs: number; fat: number };
  dinner: { calories: number; protein: number; carbs: number; fat: number };
  eveningSnack: { calories: number; protein: number; carbs: number; fat: number };
}

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionPlan)
    private nutritionPlanRepository: Repository<NutritionPlan>,
    @InjectRepository(NutritionDay)
    private nutritionDayRepository: Repository<NutritionDay>,
    @InjectRepository(Meal)
    private mealRepository: Repository<Meal>,
    @InjectRepository(FoodItem)
    private foodItemRepository: Repository<FoodItem>,
    private inBodyService: InBodyService,
  ) {}

  async createPersonalizedNutritionPlan(
    userId: number,
    coachId: number,
    inbodyTestId: number,
    goal: NutritionGoal,
    dietType: DietType,
    durationWeeks: number,
    preferences?: {
      allergies?: string[];
      foodPreferences?: string[];
      foodsToAvoid?: string[];
      mealsPerDay?: number;
    }
  ): Promise<NutritionPlan> {
    const inbodyTest = await this.inBodyService.getLatestInBodyTest(userId);
    if (!inbodyTest) {
      throw new Error('No InBody test found for user');
    }

    const user = await this.getUserById(userId);
    const analysis = await this.inBodyService.analyzeInBodyData(inbodyTest, user);

    // Adjust calories based on goal
    const adjustedCalories = this.adjustCaloriesForGoal(analysis.targetCalories, goal);
    const macros = this.calculateMacros(adjustedCalories, dietType);

    const nutritionPlan = this.nutritionPlanRepository.create({
      userId,
      coachId,
      inbodyTestId,
      name: `${goal.replace('_', ' ')} Plan - ${dietType.replace('_', ' ')}`,
      description: `Personalized nutrition plan based on InBody test results`,
      goal,
      dietType,
      durationWeeks,
      dailyCalories: adjustedCalories,
      proteinGrams: macros.protein,
      carbsGrams: macros.carbs,
      fatGrams: macros.fat,
      fiberGrams: this.calculateFiber(adjustedCalories),
      waterLiters: this.calculateWaterNeeds(inbodyTest.weight),
      mealsPerDay: preferences?.mealsPerDay || 6,
      mealTiming: this.generateMealTiming(preferences?.mealsPerDay || 6, adjustedCalories),
      supplements: this.recommendSupplements(inbodyTest, goal),
      allergies: preferences?.allergies || [],
      foodPreferences: preferences?.foodPreferences || [],
      foodsToAvoid: preferences?.foodsToAvoid || [],
    });

    const savedPlan = await this.nutritionPlanRepository.save(nutritionPlan);

    // Generate daily meal plans
    await this.generateDailyMealPlans(savedPlan, macros);

    return savedPlan;
  }

  private async generateDailyMealPlans(plan: NutritionPlan, macros: any): Promise<void> {
    const daysTotal = plan.durationWeeks * 7;
    const mealTemplate = this.createMealTemplate(plan.dailyCalories, macros);

    for (let week = 1; week <= plan.durationWeeks; week++) {
      for (let day = 1; day <= 7; day++) {
        const dayNumber = (week - 1) * 7 + day;
        
        const nutritionDay = this.nutritionDayRepository.create({
          nutritionPlanId: plan.id,
          dayNumber,
          weekNumber: week,
          name: `Day ${dayNumber} - Week ${week}`,
          description: `Balanced nutrition for ${plan.goal.replace('_', ' ')}`,
          totalCalories: plan.dailyCalories,
          totalProtein: macros.protein,
          totalCarbs: macros.carbs,
          totalFat: macros.fat,
          totalFiber: plan.fiberGrams,
          dailyTips: this.generateDailyTips(dayNumber, plan.goal),
          hydrationSchedule: this.generateHydrationSchedule(plan.waterLiters),
        });

        const savedDay = await this.nutritionDayRepository.save(nutritionDay);
        await this.generateMealsForDay(savedDay, mealTemplate, plan);
      }
    }
  }

  private async generateMealsForDay(
    nutritionDay: NutritionDay,
    mealTemplate: MealPlanTemplate,
    plan: NutritionPlan
  ): Promise<void> {
    const meals = [
      { type: MealType.BREAKFAST, data: mealTemplate.breakfast, time: '07:00' },
      { type: MealType.MORNING_SNACK, data: mealTemplate.morningSnack, time: '10:00' },
      { type: MealType.LUNCH, data: mealTemplate.lunch, time: '13:00' },
      { type: MealType.AFTERNOON_SNACK, data: mealTemplate.afternoonSnack, time: '16:00' },
      { type: MealType.DINNER, data: mealTemplate.dinner, time: '19:00' },
      { type: MealType.EVENING_SNACK, data: mealTemplate.eveningSnack, time: '21:00' },
    ];

    for (const mealInfo of meals) {
      const meal = this.mealRepository.create({
        nutritionDayId: nutritionDay.id,
        type: mealInfo.type,
        name: this.getMealName(mealInfo.type, nutritionDay.dayNumber),
        description: `Nutritious ${mealInfo.type.replace('_', ' ')} meal`,
        suggestedTime: mealInfo.time,
        preparationTimeMinutes: this.getPreparationTime(mealInfo.type),
        calories: mealInfo.data.calories,
        protein: mealInfo.data.protein,
        carbs: mealInfo.data.carbs,
        fat: mealInfo.data.fat,
        fiber: Math.round(mealInfo.data.calories * 0.014), // ~14g fiber per 1000 calories
        cookingInstructions: this.generateCookingInstructions(mealInfo.type),
        cookingTips: this.generateCookingTips(mealInfo.type),
        substitutions: this.generateSubstitutions(mealInfo.type, plan.dietType),
      });

      const savedMeal = await this.mealRepository.save(meal);
      await this.generateFoodItemsForMeal(savedMeal, plan.dietType);
    }
  }

  private async generateFoodItemsForMeal(meal: Meal, dietType: DietType): Promise<void> {
    const foodItems = this.getFoodItemsForMeal(meal.type, meal.calories, dietType);

    for (const item of foodItems) {
      const foodItem = this.foodItemRepository.create({
        mealId: meal.id,
        ...item,
      });

      await this.foodItemRepository.save(foodItem);
    }
  }

  private getFoodItemsForMeal(mealType: MealType, targetCalories: number, dietType: DietType): any[] {
    // This is a simplified example - in a real application, you'd have a comprehensive food database
    const foodDatabase = this.getFoodDatabase(dietType);
    const mealFoods = foodDatabase[mealType] || [];

    // Select foods to meet calorie target
    const selectedFoods = [];
    let remainingCalories = targetCalories;

    for (const food of mealFoods) {
      if (remainingCalories > 0) {
        const quantity = Math.min(
          Math.ceil(remainingCalories / food.caloriesPerUnit),
          food.maxQuantity || 3
        );

        selectedFoods.push({
          name: food.name,
          description: food.description,
          quantity,
          unit: food.unit,
          caloriesPerUnit: food.caloriesPerUnit,
          proteinPerUnit: food.proteinPerUnit,
          carbsPerUnit: food.carbsPerUnit,
          fatPerUnit: food.fatPerUnit,
          fiberPerUnit: food.fiberPerUnit,
          totalCalories: quantity * food.caloriesPerUnit,
          totalProtein: quantity * food.proteinPerUnit,
          totalCarbs: quantity * food.carbsPerUnit,
          totalFat: quantity * food.fatPerUnit,
          totalFiber: quantity * food.fiberPerUnit,
          preparationNotes: food.preparationNotes,
        });

        remainingCalories -= quantity * food.caloriesPerUnit;
      }
    }

    return selectedFoods;
  }

  private adjustCaloriesForGoal(baseCalories: number, goal: NutritionGoal): number {
    switch (goal) {
      case NutritionGoal.WEIGHT_LOSS:
      case NutritionGoal.CUTTING:
        return Math.round(baseCalories * 0.8); // 20% deficit
      case NutritionGoal.WEIGHT_GAIN:
      case NutritionGoal.BULKING:
        return Math.round(baseCalories * 1.15); // 15% surplus
      case NutritionGoal.MUSCLE_GAIN:
        return Math.round(baseCalories * 1.1); // 10% surplus
      default:
        return baseCalories;
    }
  }

  private calculateMacros(calories: number, dietType: DietType) {
    let proteinRatio, carbRatio, fatRatio;

    switch (dietType) {
      case DietType.HIGH_PROTEIN:
        proteinRatio = 0.35; carbRatio = 0.35; fatRatio = 0.30;
        break;
      case DietType.LOW_CARB:
        proteinRatio = 0.30; carbRatio = 0.20; fatRatio = 0.50;
        break;
      case DietType.KETO:
        proteinRatio = 0.25; carbRatio = 0.05; fatRatio = 0.70;
        break;
      default:
        proteinRatio = 0.25; carbRatio = 0.45; fatRatio = 0.30;
    }

    return {
      protein: Math.round((calories * proteinRatio) / 4),
      carbs: Math.round((calories * carbRatio) / 4),
      fat: Math.round((calories * fatRatio) / 9),
    };
  }

  private createMealTemplate(dailyCalories: number, macros: any): MealPlanTemplate {
    return {
      breakfast: { calories: Math.round(dailyCalories * 0.25), protein: Math.round(macros.protein * 0.25), carbs: Math.round(macros.carbs * 0.25), fat: Math.round(macros.fat * 0.25) },
      morningSnack: { calories: Math.round(dailyCalories * 0.10), protein: Math.round(macros.protein * 0.10), carbs: Math.round(macros.carbs * 0.10), fat: Math.round(macros.fat * 0.10) },
      lunch: { calories: Math.round(dailyCalories * 0.30), protein: Math.round(macros.protein * 0.30), carbs: Math.round(macros.carbs * 0.30), fat: Math.round(macros.fat * 0.30) },
      afternoonSnack: { calories: Math.round(dailyCalories * 0.10), protein: Math.round(macros.protein * 0.10), carbs: Math.round(macros.carbs * 0.10), fat: Math.round(macros.fat * 0.10) },
      dinner: { calories: Math.round(dailyCalories * 0.20), protein: Math.round(macros.protein * 0.20), carbs: Math.round(macros.carbs * 0.20), fat: Math.round(macros.fat * 0.20) },
      eveningSnack: { calories: Math.round(dailyCalories * 0.05), protein: Math.round(macros.protein * 0.05), carbs: Math.round(macros.carbs * 0.05), fat: Math.round(macros.fat * 0.05) },
    };
  }

  private getFoodDatabase(dietType: DietType) {
    // Simplified food database - in production, this would be much more comprehensive
    const baseDatabase = {
      [MealType.BREAKFAST]: [
        { name: 'Oatmeal', caloriesPerUnit: 150, proteinPerUnit: 5, carbsPerUnit: 27, fatPerUnit: 3, fiberPerUnit: 4, unit: 'cup', maxQuantity: 2, preparationNotes: 'Cook with water or milk' },
        { name: 'Greek Yogurt', caloriesPerUnit: 100, proteinPerUnit: 17, carbsPerUnit: 6, fatPerUnit: 0, fiberPerUnit: 0, unit: 'cup', maxQuantity: 2, preparationNotes: 'Plain, low-fat' },
        { name: 'Banana', caloriesPerUnit: 105, proteinPerUnit: 1, carbsPerUnit: 27, fatPerUnit: 0, fiberPerUnit: 3, unit: 'piece', maxQuantity: 2, preparationNotes: 'Fresh, medium size' },
      ],
      [MealType.LUNCH]: [
        { name: 'Chicken Breast', caloriesPerUnit: 165, proteinPerUnit: 31, carbsPerUnit: 0, fatPerUnit: 4, fiberPerUnit: 0, unit: '100g', maxQuantity: 2, preparationNotes: 'Grilled or baked' },
        { name: 'Brown Rice', caloriesPerUnit: 110, proteinPerUnit: 3, carbsPerUnit: 23, fatPerUnit: 1, fiberPerUnit: 2, unit: 'half cup', maxQuantity: 3, preparationNotes: 'Cooked' },
        { name: 'Broccoli', caloriesPerUnit: 25, proteinPerUnit: 3, carbsPerUnit: 5, fatPerUnit: 0, fiberPerUnit: 3, unit: 'cup', maxQuantity: 2, preparationNotes: 'Steamed' },
      ],
      [MealType.DINNER]: [
        { name: 'Salmon Fillet', caloriesPerUnit: 206, proteinPerUnit: 22, carbsPerUnit: 0, fatPerUnit: 12, fiberPerUnit: 0, unit: '100g', maxQuantity: 2, preparationNotes: 'Baked or grilled' },
        { name: 'Sweet Potato', caloriesPerUnit: 103, proteinPerUnit: 2, carbsPerUnit: 24, fatPerUnit: 0, fiberPerUnit: 4, unit: 'medium', maxQuantity: 2, preparationNotes: 'Baked' },
        { name: 'Spinach', caloriesPerUnit: 7, proteinPerUnit: 1, carbsPerUnit: 1, fatPerUnit: 0, fiberPerUnit: 1, unit: 'cup', maxQuantity: 3, preparationNotes: 'Fresh or sautéed' },
      ],
    };

    return baseDatabase;
  }

  private generateMealTiming(mealsPerDay: number, dailyCalories: number) {
    const meals = [
      { meal: 'Breakfast', time: '07:00', calories: Math.round(dailyCalories * 0.25) },
      { meal: 'Morning Snack', time: '10:00', calories: Math.round(dailyCalories * 0.10) },
      { meal: 'Lunch', time: '13:00', calories: Math.round(dailyCalories * 0.30) },
      { meal: 'Afternoon Snack', time: '16:00', calories: Math.round(dailyCalories * 0.10) },
      { meal: 'Dinner', time: '19:00', calories: Math.round(dailyCalories * 0.20) },
      { meal: 'Evening Snack', time: '21:00', calories: Math.round(dailyCalories * 0.05) },
    ];

    return meals.slice(0, mealsPerDay);
  }

  private recommendSupplements(inbodyTest: InBodyTest, goal: NutritionGoal) {
    const supplements = [];

    if (goal === NutritionGoal.MUSCLE_GAIN || goal === NutritionGoal.BULKING) {
      supplements.push({ name: 'Whey Protein', dosage: '25-30g', timing: 'Post-workout' });
      supplements.push({ name: 'Creatine', dosage: '5g', timing: 'Daily' });
    }

    if (inbodyTest.bodyFatPercentage > 20) {
      supplements.push({ name: 'L-Carnitine', dosage: '2g', timing: 'Pre-workout' });
    }

    supplements.push({ name: 'Multivitamin', dosage: '1 tablet', timing: 'With breakfast' });
    supplements.push({ name: 'Omega-3', dosage: '1000mg', timing: 'With dinner' });

    return supplements;
  }

  private calculateFiber(calories: number): number {
    return Math.round(calories * 0.014); // 14g fiber per 1000 calories
  }

  private calculateWaterNeeds(weight: number): number {
    return Math.round((weight * 35) / 1000 * 10) / 10; // 35ml per kg body weight
  }

  private generateDailyTips(dayNumber: number, goal: NutritionGoal): string {
    const tips = {
      [NutritionGoal.WEIGHT_LOSS]: [
        'Stay hydrated throughout the day',
        'Eat slowly and mindfully',
        'Include fiber-rich foods to stay full',
        'Track your portion sizes',
      ],
      [NutritionGoal.MUSCLE_GAIN]: [
        'Consume protein within 30 minutes post-workout',
        'Eat frequently throughout the day',
        'Don\'t skip meals, especially breakfast',
        'Include healthy fats for hormone production',
      ],
    };

    const goalTips = tips[goal] || tips[NutritionGoal.WEIGHT_LOSS];
    return goalTips[dayNumber % goalTips.length];
  }

  private generateHydrationSchedule(waterLiters: number) {
    const schedule = [];
    const glassSize = 0.25; // 250ml glass
    const glassesNeeded = Math.ceil(waterLiters / glassSize);
    const times = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];

    for (let i = 0; i < Math.min(glassesNeeded, times.length); i++) {
      schedule.push({
        time: times[i],
        amount: glassSize,
        type: 'Water',
      });
    }

    return schedule;
  }

  private getMealName(mealType: MealType, dayNumber: number): string {
    const names = {
      [MealType.BREAKFAST]: ['Power Breakfast', 'Morning Fuel', 'Energy Start'],
      [MealType.LUNCH]: ['Balanced Lunch', 'Midday Boost', 'Protein Power'],
      [MealType.DINNER]: ['Lean Dinner', 'Evening Nutrition', 'Recovery Meal'],
    };

    const mealNames = names[mealType] || ['Healthy Meal'];
    return mealNames[dayNumber % mealNames.length];
  }

  private getPreparationTime(mealType: MealType): number {
    const times = {
      [MealType.BREAKFAST]: 15,
      [MealType.MORNING_SNACK]: 5,
      [MealType.LUNCH]: 25,
      [MealType.AFTERNOON_SNACK]: 5,
      [MealType.DINNER]: 30,
      [MealType.EVENING_SNACK]: 5,
    };

    return times[mealType] || 15;
  }

  private generateCookingInstructions(mealType: MealType): string {
    const instructions = {
      [MealType.BREAKFAST]: 'Prepare ingredients the night before for quick assembly.',
      [MealType.LUNCH]: 'Cook proteins in batches for meal prep efficiency.',
      [MealType.DINNER]: 'Focus on balanced macronutrients and colorful vegetables.',
    };

    return instructions[mealType] || 'Follow standard cooking practices for food safety.';
  }

  private generateCookingTips(mealType: MealType): string[] {
    return [
      'Use minimal oil for cooking',
      'Season with herbs and spices instead of salt',
      'Steam or grill for healthier preparation',
    ];
  }

  private generateSubstitutions(mealType: MealType, dietType: DietType) {
    return [
      { original: 'White rice', substitute: 'Quinoa', reason: 'Higher protein content' },
      { original: 'Regular pasta', substitute: 'Zucchini noodles', reason: 'Lower carbs' },
    ];
  }

  private async getUserById(userId: number): Promise<User> {
    // This would typically be injected from UserService
    // For now, returning a mock implementation
    throw new Error('User service integration needed');
  }

  async getUserNutritionPlans(userId: number): Promise<NutritionPlan[]> {
    return this.nutritionPlanRepository.find({
      where: { userId },
      relations: ['coach', 'inbodyTest'],
      order: { createdAt: 'DESC' },
    });
  }

  async getNutritionPlanDetails(planId: number): Promise<NutritionPlan> {
    return this.nutritionPlanRepository.findOne({
      where: { id: planId },
      relations: ['nutritionDays', 'nutritionDays.meals', 'nutritionDays.meals.foodItems'],
    });
  }
}
