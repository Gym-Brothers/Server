import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { NutritionService } from '../services/nutrition.service';
import { NutritionGoal, DietType } from '../entities/nutrition-plan.entity';

@Controller('api/nutrition')
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('plan')
  async createNutritionPlan(
    @CurrentUser() user: any,
    @Body() planData: {
      coachId: number;
      inbodyTestId: number;
      goal: NutritionGoal;
      dietType: DietType;
      durationWeeks: number;
      preferences?: {
        allergies?: string[];
        foodPreferences?: string[];
        foodsToAvoid?: string[];
        mealsPerDay?: number;
      };
    },
  ) {
    return this.nutritionService.createPersonalizedNutritionPlan(
      user.id,
      planData.coachId,
      planData.inbodyTestId,
      planData.goal,
      planData.dietType,
      planData.durationWeeks,
      planData.preferences,
    );
  }

  @Get('plans')
  async getUserNutritionPlans(@CurrentUser() user: any) {
    return this.nutritionService.getUserNutritionPlans(user.id);
  }

  @Get('plan/:planId')
  async getNutritionPlanDetails(@Param('planId', ParseIntPipe) planId: number) {
    return this.nutritionService.getNutritionPlanDetails(planId);
  }

  @Get('plan/:planId/day/:dayNumber')
  async getDailyMealPlan(
    @Param('planId', ParseIntPipe) planId: number,
    @Param('dayNumber', ParseIntPipe) dayNumber: number,
  ) {
    const plan = await this.nutritionService.getNutritionPlanDetails(planId);
    const day = plan.nutritionDays.find(d => d.dayNumber === dayNumber);
    
    return {
      day,
      summary: {
        totalCalories: day.totalCalories,
        totalProtein: day.totalProtein,
        totalCarbs: day.totalCarbs,
        totalFat: day.totalFat,
        totalFiber: day.totalFiber,
        mealsCount: day.meals.length,
      },
      hydrationSchedule: day.hydrationSchedule,
      dailyTips: day.dailyTips,
    };
  }

  @Get('plan/:planId/week/:weekNumber')
  async getWeeklyMealPlan(
    @Param('planId', ParseIntPipe) planId: number,
    @Param('weekNumber', ParseIntPipe) weekNumber: number,
  ) {
    const plan = await this.nutritionService.getNutritionPlanDetails(planId);
    const weekDays = plan.nutritionDays.filter(d => d.weekNumber === weekNumber);
    
    return {
      weekNumber,
      days: weekDays,
      weekSummary: {
        avgCalories: weekDays.reduce((sum, day) => sum + day.totalCalories, 0) / weekDays.length,
        avgProtein: weekDays.reduce((sum, day) => sum + day.totalProtein, 0) / weekDays.length,
        avgCarbs: weekDays.reduce((sum, day) => sum + day.totalCarbs, 0) / weekDays.length,
        avgFat: weekDays.reduce((sum, day) => sum + day.totalFat, 0) / weekDays.length,
      },
    };
  }

  @Get('shopping-list/:planId')
  async getShoppingList(
    @Param('planId', ParseIntPipe) planId: number,
    @Query('weeks') weeks?: string,
  ) {
    const plan = await this.nutritionService.getNutritionPlanDetails(planId);
    const weekNumbers = weeks ? weeks.split(',').map(Number) : [1];
    
    const relevantDays = plan.nutritionDays.filter(day => 
      weekNumbers.includes(day.weekNumber)
    );

    const shoppingList = {};
    
    relevantDays.forEach(day => {
      day.meals.forEach(meal => {
        meal.foodItems.forEach(item => {
          if (shoppingList[item.name]) {
            shoppingList[item.name].quantity += item.quantity;
          } else {
            shoppingList[item.name] = {
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              brand: item.brand,
            };
          }
        });
      });
    });

    return {
      weeks: weekNumbers,
      items: Object.values(shoppingList),
      totalItems: Object.keys(shoppingList).length,
    };
  }

  @Get('meal-prep/:planId')
  async getMealPrepGuide(
    @Param('planId', ParseIntPipe) planId: number,
    @Query('week', ParseIntPipe) week: number = 1,
  ) {
    const plan = await this.nutritionService.getNutritionPlanDetails(planId);
    const weekDays = plan.nutritionDays.filter(d => d.weekNumber === week);
    
    const prepGuide = {
      week,
      prepDay: 'Sunday',
      estimatedTime: '2-3 hours',
      steps: [
        'Shop for all ingredients',
        'Prep vegetables and fruits',
        'Cook proteins in batches',
        'Prepare grains and starches',
        'Portion meals into containers',
        'Label and store properly',
      ],
      batchCooking: {},
      storage: {},
    };

    // Analyze meals for batch cooking opportunities
    const proteinItems = [];
    const grainItems = [];
    
    weekDays.forEach(day => {
      day.meals.forEach(meal => {
        meal.foodItems.forEach(item => {
          if (item.name.includes('Chicken') || item.name.includes('Salmon')) {
            proteinItems.push(item);
          }
          if (item.name.includes('Rice') || item.name.includes('Quinoa')) {
            grainItems.push(item);
          }
        });
      });
    });

    prepGuide.batchCooking = {
      proteins: proteinItems,
      grains: grainItems,
    };

    return prepGuide;
  }
}
