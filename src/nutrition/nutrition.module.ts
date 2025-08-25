import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionController } from '../controllers/nutrition.controller';
import { NutritionService } from '../services/nutrition.service';
import { InBodyService } from '../services/inbody.service';
import { NutritionPlan } from '../entities/nutrition-plan.entity';
import { NutritionDay } from '../entities/nutrition-day.entity';
import { Meal } from '../entities/meal.entity';
import { FoodItem } from '../entities/food-item.entity';
import { InBodyTest } from '../entities/inbody-test.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NutritionPlan,
      NutritionDay,
      Meal,
      FoodItem,
      InBodyTest,
      User,
    ]),
  ],
  controllers: [NutritionController],
  providers: [NutritionService, InBodyService],
  exports: [NutritionService],
})
export class NutritionModule {}
