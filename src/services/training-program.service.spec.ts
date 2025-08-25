import { Test, TestingModule } from '@nestjs/testing';
import { TrainingProgramService } from './training-program.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TrainingProgram, ProgramDifficulty, ProgramType } from '../entities/training-program.entity';
import { TrainingDay } from '../entities/training-day.entity';
import { Exercise } from '../entities/exercise.entity';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('TrainingProgramService', () => {
  let service: TrainingProgramService;
  let trainingProgramRepository: Repository<TrainingProgram>;
  let trainingDayRepository: Repository<TrainingDay>;
  let exerciseRepository: Repository<Exercise>;
  let userRepository: Repository<User>;

  const mockTrainingProgram = {
    id: 1,
    coachId: 1,
    name: 'Beginner Strength Building',
    description: '8-week program for building foundational strength',
    difficulty: ProgramDifficulty.BEGINNER,
    type: ProgramType.STRENGTH,
    durationWeeks: 8,
    daysPerWeek: 3,
    estimatedDurationMinutes: 60,
    equipmentNeeded: ['barbell', 'dumbbells'],
    targetMuscles: ['chest', 'back', 'legs'],
    isPublic: true,
    price: 99.99
  };

  const mockTrainingDay = {
    id: 1,
    programId: 1,
    dayNumber: 1,
    weekNumber: 1,
    name: 'Upper Body Strength',
    restDay: false,
    estimatedDurationMinutes: 60,
    focusAreas: ['chest', 'back', 'shoulders']
  };

  const mockExercise = {
    id: 1,
    trainingDayId: 1,
    name: 'Push-ups',
    type: 'strength',
    sets: 3,
    reps: 12,
    restSeconds: 60,
    targetMuscles: ['chest', 'triceps'],
    equipmentNeeded: []
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingProgramService,
        {
          provide: getRepositoryToken(TrainingProgram),
          useValue: {
            create: jest.fn().mockReturnValue(mockTrainingProgram),
            save: jest.fn().mockResolvedValue(mockTrainingProgram),
            find: jest.fn().mockResolvedValue([mockTrainingProgram]),
            findOne: jest.fn().mockResolvedValue(mockTrainingProgram),
            update: jest.fn().mockResolvedValue(undefined),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockTrainingProgram]),
            })),
          },
        },
        {
          provide: getRepositoryToken(TrainingDay),
          useValue: {
            create: jest.fn().mockReturnValue(mockTrainingDay),
            save: jest.fn().mockResolvedValue(mockTrainingDay),
          },
        },
        {
          provide: getRepositoryToken(Exercise),
          useValue: {
            create: jest.fn().mockReturnValue(mockExercise),
            save: jest.fn().mockResolvedValue(mockExercise),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1, username: 'testuser' }),
          },
        },
      ],
    }).compile();

    service = module.get<TrainingProgramService>(TrainingProgramService);
    trainingProgramRepository = module.get<Repository<TrainingProgram>>(getRepositoryToken(TrainingProgram));
    trainingDayRepository = module.get<Repository<TrainingDay>>(getRepositoryToken(TrainingDay));
    exerciseRepository = module.get<Repository<Exercise>>(getRepositoryToken(Exercise));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTrainingProgram', () => {
    it('should create a training program and generate training days', async () => {
      const generateTrainingDaysSpy = jest.spyOn(service as any, 'generateTrainingDays').mockResolvedValue(undefined);

      const result = await service.createTrainingProgram(1, mockTrainingProgram);

      expect(trainingProgramRepository.create).toHaveBeenCalledWith({
        coachId: 1,
        ...mockTrainingProgram,
      });
      expect(generateTrainingDaysSpy).toHaveBeenCalledWith(mockTrainingProgram);
      expect(result).toEqual(mockTrainingProgram);
    });
  });

  describe('assignProgramToUser', () => {
    it('should assign program to user successfully', async () => {
      await service.assignProgramToUser(1, 1, 1);

      expect(trainingProgramRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, coachId: 1 },
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(trainingProgramRepository.update).toHaveBeenCalledWith(1, { userId: 1 });
    });

    it('should throw NotFoundException when program not found', async () => {
      jest.spyOn(trainingProgramRepository, 'findOne').mockResolvedValue(null);
      await expect(service.assignProgramToUser(1, 1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPublicPrograms', () => {
    it('should return public programs with filters', async () => {
      const result = await service.getPublicPrograms(ProgramType.STRENGTH, ProgramDifficulty.BEGINNER);
      expect(trainingProgramRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual([mockTrainingProgram]);
    });
  });
});

