import { Test, TestingModule } from '@nestjs/testing';
import { InBodyController } from './inbody.controller';
import { InBodyService } from '../services/inbody.service';

describe('InBodyController', () => {
  let controller: InBodyController;
  let inBodyService: InBodyService;

  const mockUser = { id: 1, username: 'testuser' };

  const mockInBodyTest = {
    id: 1,
    userId: 1,
    weight: 75.5,
    height: 175.0,
    bodyFatPercentage: 16.3,
    skeletalMuscleMass: 32.8,
    testDate: new Date(),
    createdAt: new Date()
  };

  const mockAnalysis = {
    bmi: 24.7,
    bodyFatCategory: 'Fitness',
    muscleMassCategory: 'Excellent',
    recommendations: ['Maintain current muscle mass'],
    targetCalories: 2200,
    targetProtein: 140
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InBodyController],
      providers: [
        {
          provide: InBodyService,
          useValue: {
            createInBodyTest: jest.fn().mockResolvedValue(mockInBodyTest),
            getUserInBodyTests: jest.fn().mockResolvedValue([mockInBodyTest]),
            getLatestInBodyTest: jest.fn().mockResolvedValue(mockInBodyTest),
            analyzeInBodyData: jest.fn().mockResolvedValue(mockAnalysis),
          },
        },
      ],
    }).compile();

    controller = module.get<InBodyController>(InBodyController);
    inBodyService = module.get<InBodyService>(InBodyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createInBodyTest', () => {
    it('should create InBody test successfully', async () => {
      const result = await controller.createInBodyTest(mockUser, mockInBodyTest);
      expect(inBodyService.createInBodyTest).toHaveBeenCalledWith(1, mockInBodyTest);
      expect(result).toEqual(mockInBodyTest);
    });
  });

  describe('getUserInBodyTests', () => {
    it('should return user InBody tests', async () => {
      const result = await controller.getUserInBodyTests(mockUser);
      expect(inBodyService.getUserInBodyTests).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockInBodyTest]);
    });
  });

  describe('getInBodyAnalysis', () => {
    it('should return InBody analysis for specific test', async () => {
      const result = await controller.getInBodyAnalysis(1, mockUser);
      expect(inBodyService.getUserInBodyTests).toHaveBeenCalledWith(1);
      expect(inBodyService.analyzeInBodyData).toHaveBeenCalledWith(mockInBodyTest, mockUser);
      expect(result).toEqual(mockAnalysis);
    });

    it('should throw error when test not found', async () => {
      jest.spyOn(inBodyService, 'getUserInBodyTests').mockResolvedValue([]);
      await expect(controller.getInBodyAnalysis(999, mockUser))
        .rejects.toThrow('InBody test not found');
    });
  });

  describe('getProgressAnalysis', () => {
    it('should return progress analysis between two tests', async () => {
      const oldTest = { ...mockInBodyTest, id: 2, weight: 77, bodyFatPercentage: 18, skeletalMuscleMass: 32.8, totalBodyWater: 45.2, basalMetabolicRate: 1680, testDate: new Date('2025-01-01') };
      const newTest = { ...mockInBodyTest, id: 1, testDate: new Date('2025-02-01') };
      
      jest.spyOn(inBodyService, 'getUserInBodyTests').mockResolvedValue([newTest, oldTest] as any);

      const result = await controller.getProgressAnalysis(mockUser);

      expect(result.weightChange).toBeCloseTo(-1.5);
      expect(result.bodyFatChange).toBeCloseTo(-1.7);
    });
  });
});

