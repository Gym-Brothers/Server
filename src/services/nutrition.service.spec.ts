import { Test, TestingModule } from '@nestjs/testing';
import { NutritionService } from './nutrition.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NutritionPlan, NutritionGoal, DietType } from '../entities/nutrition-plan.entity';
import { NutritionDay } from '../entities/nutrition-day.entity';
import { Meal } from '../entities/meal.entity';
import { FoodItem } from '../entities/food-item.entity';
import { InBodyService } from './inbody.service';
import { User } from '../entities/user.entity';
import { InBodyTest } from '../entities/inbody-test.entity';

describe('NutritionService', () => {
  let service: NutritionService;
  let nutritionPlanRepository: Repository<NutritionPlan>;
  let inBodyService: InBodyService;

  const mockInBodyTest = {
    id: 1,
    userId: 1,
    weight: 75.5,
    height: 175.0,
    skeletalMuscleMass: 32.8,
    bodyFatPercentage: 16.3,
    basalMetabolicRate: 1680,
    totalBodyWater: 45.2
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    activityLevel: 'moderately_active'
  };

  const mockNutritionPlan = {
    id: 1,
    userId: 1,
    coachId: 1,
    inbodyTestId: 1,
    name: 'Weight Loss Plan - High Protein',
    goal: NutritionGoal.WEIGHT_LOSS,
    dietType: DietType.HIGH_PROTEIN,
    durationWeeks: 8,
    dailyCalories: 1800,
    proteinGrams: 140,
    carbsGrams: 135,
    fatGrams: 60,
    mealsPerDay: 6
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionService,
        {
          provide: getRepositoryToken(NutritionPlan),
          useValue: {
            create: jest.fn().mockReturnValue(mockNutritionPlan),
            save: jest.fn().mockResolvedValue(mockNutritionPlan),
            find: jest.fn().mockResolvedValue([mockNutritionPlan]),
            findOne: jest.fn().mockResolvedValue(mockNutritionPlan),
          },
        },
        {
          provide: getRepositoryToken(NutritionDay),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(Meal),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(FoodItem),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
        {
          provide: InBodyService,
          useValue: {
            getLatestInBodyTest: jest.fn().mockResolvedValue(mockInBodyTest),
            analyzeInBodyData: jest.fn().mockResolvedValue({
              targetCalories: 2200,
              targetProtein: 140,
              targetCarbs: 220,
              targetFat: 75
            }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn().mockResolvedValue(mockUser) },
        },
        {
            provide: getRepositoryToken(InBodyTest),
            useValue: { findOne: jest.fn().mockResolvedValue(mockInBodyTest) },
        }
      ],
    }).compile();

    service = module.get<NutritionService>(NutritionService);
    nutritionPlanRepository = module.get<Repository<NutritionPlan>>(getRepositoryToken(NutritionPlan));
    inBodyService = module.get<InBodyService>(InBodyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPersonalizedNutritionPlan', () => {
    it('should create a personalized nutrition plan', async () => {
      // Mock the private method to avoid direct dependency on another service's implementation
      jest.spyOn(service as any, 'getUserById').mockResolvedValue(mockUser);
      const generateDailyMealPlansSpy = jest.spyOn(service as any, 'generateDailyMealPlans').mockResolvedValue(undefined);

      const result = await service.createPersonalizedNutritionPlan(
        1, 1, 1,
        NutritionGoal.WEIGHT_LOSS,
        DietType.HIGH_PROTEIN,
        8,
        {}
      );

      expect(inBodyService.getLatestInBodyTest).toHaveBeenCalledWith(1);
      expect(generateDailyMealPlansSpy).toHaveBeenCalled();
      expect(result).toEqual(mockNutritionPlan);
    });
  });

  describe('getUserNutritionPlans', () => {
    it('should return user nutrition plans', async () => {
      const result = await service.getUserNutritionPlans(1);
      expect(nutritionPlanRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['coach', 'inbodyTest'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockNutritionPlan]);
    });
  });
});

