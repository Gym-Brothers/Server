import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeService } from './realtime.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutSession, WorkoutStatus } from '../entities/workout-session.entity';
import { ExercisePerformance } from '../entities/exercise-performance.entity';
import { HealthAlert, HealthAlertType, AlertSeverity } from '../entities/health-alert.entity';
import { SmartGoal, GoalStatus } from '../entities/smart-goal.entity';

describe('RealtimeService', () => {
  let service: RealtimeService;
  let workoutRepository: Repository<WorkoutSession>;
  let performanceRepository: Repository<ExercisePerformance>;
  let healthAlertRepository: Repository<HealthAlert>;
  let smartGoalRepository: Repository<SmartGoal>;

  const mockWorkoutSession = {
    id: 1,
    userId: 1,
    trainingDayId: 1,
    trainingProgramId: 1,
    status: WorkoutStatus.IN_PROGRESS,
    startedAt: new Date(),
    scheduledDate: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeService,
        {
          provide: getRepositoryToken(WorkoutSession),
          useValue: {
            create: jest.fn().mockReturnValue(mockWorkoutSession),
            save: jest.fn().mockResolvedValue(mockWorkoutSession),
            findOne: jest.fn().mockResolvedValue(mockWorkoutSession),
            update: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(ExercisePerformance),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(null),
            })),
          },
        },
        {
          provide: getRepositoryToken(HealthAlert),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SmartGoal),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RealtimeService>(RealtimeService);
    workoutRepository = module.get<Repository<WorkoutSession>>(getRepositoryToken(WorkoutSession));
    performanceRepository = module.get<Repository<ExercisePerformance>>(getRepositoryToken(ExercisePerformance));
    healthAlertRepository = module.get<Repository<HealthAlert>>(getRepositoryToken(HealthAlert));
    smartGoalRepository = module.get<Repository<SmartGoal>>(getRepositoryToken(SmartGoal));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startWorkout', () => {
    it('should create and start a new workout session', async () => {
      const emitSpy = jest.spyOn(service as any, 'emitWorkoutEvent').mockImplementation();
      const result = await service.startWorkout(1, 1, 1);
      expect(workoutRepository.create).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('workout_started', expect.any(Object));
      expect(result).toEqual(mockWorkoutSession);
    });
  });

  describe('completeWorkout', () => {
    it('should complete a workout session', async () => {
      const emitSpy = jest.spyOn(service as any, 'emitWorkoutEvent').mockImplementation();
      await service.completeWorkout(1, { totalCalories: 300 });
      expect(workoutRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
        status: WorkoutStatus.COMPLETED,
      }));
      expect(emitSpy).toHaveBeenCalledWith('workout_completed', expect.any(Object));
    });
  });

  describe('logExercisePerformance', () => {
    it('should log exercise performance and check for personal records', async () => {
      const performanceData = { workoutSessionId: 1, exerciseId: 1, setNumber: 1 };
      jest.spyOn(performanceRepository, 'create').mockReturnValue(performanceData as any);
      jest.spyOn(performanceRepository, 'save').mockResolvedValue(performanceData as any);
      const emitSpy = jest.spyOn(service as any, 'emitWorkoutEvent').mockImplementation();
      
      const result = await service.logExercisePerformance(performanceData);
      
      expect(performanceRepository.save).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('exercise_completed', expect.any(Object));
      expect(result).toBeDefined();
    });
  });

  describe('createHealthAlert', () => {
    it('should create a health alert', async () => {
      const alertData = { metric: 'Heart Rate', value: 190, unit: 'bpm' };
      jest.spyOn(healthAlertRepository, 'create').mockReturnValue(alertData as any);
      jest.spyOn(healthAlertRepository, 'save').mockResolvedValue(alertData as any);
      const emitSpy = jest.spyOn(service as any, 'emitHealthEvent').mockImplementation();

      await service.createHealthAlert(1, HealthAlertType.HEART_RATE_ANOMALY, alertData);

      expect(healthAlertRepository.save).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('health_alert', expect.any(Object));
    });
  });

  describe('updateGoalProgress', () => {
    it('should update goal progress and emit event', async () => {
      const mockGoal = { id: 1, userId: 1, targetValue: 100, currentValue: 50, milestones: [], startDate: new Date(), targetDate: new Date() };
      jest.spyOn(smartGoalRepository, 'findOne').mockResolvedValue(mockGoal as any);
      jest.spyOn(smartGoalRepository, 'save').mockResolvedValue(mockGoal as any);
      const emitSpy = jest.spyOn(service as any, 'emitGoalEvent').mockImplementation();

      await service.updateGoalProgress(1, 1, 60);

      expect(smartGoalRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        currentValue: 60
      }));
      expect(emitSpy).toHaveBeenCalledWith('goal_progress', expect.any(Object));
    });
  });
});

