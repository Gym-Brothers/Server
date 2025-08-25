import { Test, TestingModule } from '@nestjs/testing';
import { InBodyService } from './inbody.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InBodyTest } from '../entities/inbody-test.entity';
import { User } from '../entities/user.entity';

describe('InBodyService', () => {
  let service: InBodyService;
  let inBodyRepository: Repository<InBodyTest>;
  let userRepository: Repository<User>;

  const mockInBodyTest = {
    id: 1,
    userId: 1,
    weight: 75.5,
    height: 175.0,
    skeletalMuscleMass: 32.8,
    bodyFatMass: 12.3,
    bodyFatPercentage: 16.3,
    totalBodyWater: 45.2,
    basalMetabolicRate: 1680,
    testDate: new Date('2025-01-01'),
    bodyScore: 85,
    bodyType: 'athletic'
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    activityLevel: 'moderately_active'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InBodyService,
        {
          provide: getRepositoryToken(InBodyTest),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InBodyService>(InBodyService);
    inBodyRepository = module.get<Repository<InBodyTest>>(getRepositoryToken(InBodyTest));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createInBodyTest', () => {
    it('should create and save InBody test successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(inBodyRepository, 'create').mockReturnValue(mockInBodyTest as any);
      jest.spyOn(inBodyRepository, 'save').mockResolvedValue(mockInBodyTest as any);

      const result = await service.createInBodyTest(1, mockInBodyTest);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(inBodyRepository.create).toHaveBeenCalledWith({
        ...mockInBodyTest,
        userId: 1,
      });
      expect(result).toEqual(mockInBodyTest);
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createInBodyTest(1, mockInBodyTest)).rejects.toThrow('User not found');
    });
  });

  describe('getUserInBodyTests', () => {
    it('should return user InBody tests ordered by date', async () => {
      const tests = [mockInBodyTest, { ...mockInBodyTest, id: 2 }];
      jest.spyOn(inBodyRepository, 'find').mockResolvedValue(tests as any);

      const result = await service.getUserInBodyTests(1);

      expect(inBodyRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { testDate: 'DESC' },
      });
      expect(result).toEqual(tests);
    });
  });

  describe('getLatestInBodyTest', () => {
    it('should return the latest InBody test', async () => {
      jest.spyOn(inBodyRepository, 'findOne').mockResolvedValue(mockInBodyTest as any);

      const result = await service.getLatestInBodyTest(1);

      expect(inBodyRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { testDate: 'DESC' },
      });
      expect(result).toEqual(mockInBodyTest);
    });
  });

  describe('analyzeInBodyData', () => {
    it('should provide comprehensive body composition analysis with no specific recommendations for healthy data', async () => {
      const result = await service.analyzeInBodyData(mockInBodyTest as any, mockUser as any);

      expect(result).toHaveProperty('bmi');
      expect(result).toHaveProperty('bodyFatCategory');
      expect(result).toHaveProperty('muscleMassCategory');
      expect(result).toHaveProperty('metabolicAge');
      expect(result).toHaveProperty('hydrationStatus');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('targetCalories');
      expect(result).toHaveProperty('targetProtein');
      expect(result).toHaveProperty('targetCarbs');
      expect(result).toHaveProperty('targetFat');

      // Test BMI calculation
      expect(result.bmi).toBe(24.7); // 75.5 / (1.75^2)

      // For this healthy mock data, no specific recommendations should be generated
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBe(0);
    });

    it('should categorize body fat correctly for male', async () => {
      const result = await service.analyzeInBodyData(mockInBodyTest as any, mockUser as any);

      expect(result.bodyFatCategory).toBe('Fitness'); // 16.3% for male
    });

    it('should categorize muscle mass correctly', async () => {
      const result = await service.analyzeInBodyData(mockInBodyTest as any, mockUser as any);

      expect(result.muscleMassCategory).toBe('Good'); // 32.8kg / 75.5kg = 43.4%, which is in the "Good" range
    });

    it('should calculate nutrition targets based on BMR and activity level', async () => {
      const result = await service.analyzeInBodyData(mockInBodyTest as any, mockUser as any);

      expect(result.targetCalories).toBeGreaterThan(mockInBodyTest.basalMetabolicRate);
      expect(result.targetProtein).toBeGreaterThan(100); // Should be around 1.8g per kg
      expect(result.targetCarbs).toBeGreaterThan(0);
      expect(result.targetFat).toBeGreaterThan(0);
    });
  });

  describe('private methods through public interface', () => {
    it('should provide appropriate recommendations for high body fat', async () => {
      const highBodyFatTest = { ...mockInBodyTest, bodyFatPercentage: 28 };
      const result = await service.analyzeInBodyData(highBodyFatTest as any, mockUser as any);

      expect(result.recommendations).toContain('Focus on cardio exercises and caloric deficit for fat loss');
    });

    it('should provide hydration recommendations for low water content', async () => {
      const lowWaterTest = { ...mockInBodyTest, totalBodyWater: 35 }; // Low for 75.5kg
      const result = await service.analyzeInBodyData(lowWaterTest as any, mockUser as any);

      expect(result.hydrationStatus).toBe('Dehydrated');
      expect(result.recommendations).toContain('Increase daily water intake');
    });

    it('should provide muscle building recommendations for low muscle mass', async () => {
      const lowMuscleTest = { ...mockInBodyTest, skeletalMuscleMass: 20 }; // Low for 75.5kg
      const result = await service.analyzeInBodyData(lowMuscleTest as any, mockUser as any);

      expect(result.recommendations).toContain('Incorporate strength training to build muscle mass');
      expect(result.recommendations).toContain('Increase protein intake to support muscle growth');
    });
  });
});
