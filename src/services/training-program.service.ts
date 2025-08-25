import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingProgram, ProgramDifficulty, ProgramType } from '../entities/training-program.entity';
import { TrainingDay } from '../entities/training-day.entity';
import { Exercise, ExerciseType } from '../entities/exercise.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class TrainingProgramService {
  constructor(
    @InjectRepository(TrainingProgram)
    private trainingProgramRepository: Repository<TrainingProgram>,
    @InjectRepository(TrainingDay)
    private trainingDayRepository: Repository<TrainingDay>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createTrainingProgram(
    coachId: number,
    programData: {
      name: string;
      description: string;
      difficulty: ProgramDifficulty;
      type: ProgramType;
      durationWeeks: number;
      daysPerWeek: number;
      estimatedDurationMinutes: number;
      equipmentNeeded: string[];
      targetMuscles: string[];
      isPublic?: boolean;
      price?: number;
      currency?: string;
    }
  ): Promise<TrainingProgram> {
    const program = this.trainingProgramRepository.create({
      coachId,
      ...programData,
    });

    const savedProgram = await this.trainingProgramRepository.save(program);
    
    // Generate training days structure
    await this.generateTrainingDays(savedProgram);
    
    return savedProgram;
  }

  private async generateTrainingDays(program: TrainingProgram): Promise<void> {
    const workoutSplit = this.getWorkoutSplit(program.type, program.daysPerWeek);
    
    for (let week = 1; week <= program.durationWeeks; week++) {
      for (let day = 1; day <= 7; day++) {
        const dayNumber = (week - 1) * 7 + day;
        const workoutIndex = (day - 1) % program.daysPerWeek;
        const isRestDay = workoutIndex >= workoutSplit.length;

        const trainingDay = this.trainingDayRepository.create({
          programId: program.id,
          dayNumber,
          weekNumber: week,
          name: isRestDay ? 'Rest Day' : workoutSplit[workoutIndex].name,
          description: isRestDay ? 'Recovery and rest' : workoutSplit[workoutIndex].description,
          restDay: isRestDay,
          estimatedDurationMinutes: isRestDay ? 0 : program.estimatedDurationMinutes,
          focusAreas: isRestDay ? [] : workoutSplit[workoutIndex].focusAreas,
          warmUpInstructions: isRestDay ? null : this.getWarmUpInstructions(workoutSplit[workoutIndex].focusAreas),
          coolDownInstructions: isRestDay ? null : this.getCoolDownInstructions(),
        });

        const savedDay = await this.trainingDayRepository.save(trainingDay);
        
        if (!isRestDay) {
          await this.generateExercisesForDay(savedDay, workoutSplit[workoutIndex], program.difficulty);
        }
      }
    }
  }

  private getWorkoutSplit(type: ProgramType, daysPerWeek: number) {
    const splits = {
      [ProgramType.STRENGTH]: {
        3: [
          { name: 'Upper Body Strength', focusAreas: ['chest', 'back', 'shoulders', 'arms'], description: 'Focus on compound upper body movements' },
          { name: 'Lower Body Strength', focusAreas: ['quads', 'hamstrings', 'glutes', 'calves'], description: 'Focus on compound lower body movements' },
          { name: 'Full Body Power', focusAreas: ['full body'], description: 'Explosive movements and power development' },
        ],
        4: [
          { name: 'Push Day', focusAreas: ['chest', 'shoulders', 'triceps'], description: 'Pushing movements' },
          { name: 'Pull Day', focusAreas: ['back', 'biceps'], description: 'Pulling movements' },
          { name: 'Leg Day', focusAreas: ['quads', 'hamstrings', 'glutes', 'calves'], description: 'Lower body focus' },
          { name: 'Upper Body', focusAreas: ['chest', 'back', 'shoulders', 'arms'], description: 'Upper body hypertrophy' },
        ],
      },
      [ProgramType.MUSCLE_GAIN]: {
        4: [
          { name: 'Chest & Triceps', focusAreas: ['chest', 'triceps'], description: 'Hypertrophy focus on chest and triceps' },
          { name: 'Back & Biceps', focusAreas: ['back', 'biceps'], description: 'Hypertrophy focus on back and biceps' },
          { name: 'Legs & Glutes', focusAreas: ['quads', 'hamstrings', 'glutes', 'calves'], description: 'Lower body hypertrophy' },
          { name: 'Shoulders & Arms', focusAreas: ['shoulders', 'arms'], description: 'Shoulder and arm development' },
        ],
        5: [
          { name: 'Chest Day', focusAreas: ['chest'], description: 'Chest specialization' },
          { name: 'Back Day', focusAreas: ['back'], description: 'Back specialization' },
          { name: 'Shoulder Day', focusAreas: ['shoulders'], description: 'Shoulder specialization' },
          { name: 'Arm Day', focusAreas: ['biceps', 'triceps'], description: 'Arm specialization' },
          { name: 'Leg Day', focusAreas: ['quads', 'hamstrings', 'glutes', 'calves'], description: 'Leg specialization' },
        ],
      },
      [ProgramType.WEIGHT_LOSS]: {
        4: [
          { name: 'HIIT Cardio', focusAreas: ['cardio'], description: 'High intensity interval training' },
          { name: 'Upper Body Circuit', focusAreas: ['chest', 'back', 'shoulders', 'arms'], description: 'Upper body circuit training' },
          { name: 'Lower Body Circuit', focusAreas: ['quads', 'hamstrings', 'glutes'], description: 'Lower body circuit training' },
          { name: 'Full Body HIIT', focusAreas: ['full body'], description: 'Full body high intensity workout' },
        ],
      },
    };

    const programSplits = splits[type] || splits[ProgramType.STRENGTH];
    return programSplits[daysPerWeek] || programSplits[3];
  }

  private async generateExercisesForDay(
    trainingDay: TrainingDay,
    workoutData: any,
    difficulty: ProgramDifficulty
  ): Promise<void> {
    const exercises = this.getExercisesForWorkout(workoutData.focusAreas, difficulty);
    
    for (let i = 0; i < exercises.length; i++) {
      const exercise = this.exerciseRepository.create({
        trainingDayId: trainingDay.id,
        orderIndex: i + 1,
        ...exercises[i],
      });

      await this.exerciseRepository.save(exercise);
    }
  }

  private getExercisesForWorkout(focusAreas: string[], difficulty: ProgramDifficulty) {
    const exerciseDatabase = {
      chest: [
        { name: 'Push-ups', type: ExerciseType.STRENGTH, sets: 3, reps: 12, restSeconds: 60, targetMuscles: ['chest', 'triceps'], equipmentNeeded: [], instructions: 'Keep body straight, lower chest to floor' },
        { name: 'Bench Press', type: ExerciseType.STRENGTH, sets: 4, reps: 8, restSeconds: 90, targetMuscles: ['chest', 'triceps'], equipmentNeeded: ['barbell', 'bench'], instructions: 'Lower bar to chest, press up explosively' },
        { name: 'Dumbbell Flyes', type: ExerciseType.STRENGTH, sets: 3, reps: 12, restSeconds: 60, targetMuscles: ['chest'], equipmentNeeded: ['dumbbells', 'bench'], instructions: 'Wide arc motion, squeeze chest at top' },
      ],
      back: [
        { name: 'Pull-ups', type: ExerciseType.STRENGTH, sets: 3, reps: 8, restSeconds: 90, targetMuscles: ['back', 'biceps'], equipmentNeeded: ['pull-up bar'], instructions: 'Pull chin over bar, control descent' },
        { name: 'Bent-over Rows', type: ExerciseType.STRENGTH, sets: 4, reps: 10, restSeconds: 75, targetMuscles: ['back', 'biceps'], equipmentNeeded: ['barbell'], instructions: 'Hinge at hips, pull bar to lower chest' },
        { name: 'Lat Pulldowns', type: ExerciseType.STRENGTH, sets: 3, reps: 12, restSeconds: 60, targetMuscles: ['back', 'biceps'], equipmentNeeded: ['cable machine'], instructions: 'Pull bar to upper chest, squeeze shoulder blades' },
      ],
      legs: [
        { name: 'Squats', type: ExerciseType.STRENGTH, sets: 4, reps: 10, restSeconds: 90, targetMuscles: ['quads', 'glutes'], equipmentNeeded: ['barbell'], instructions: 'Descend until thighs parallel, drive through heels' },
        { name: 'Deadlifts', type: ExerciseType.STRENGTH, sets: 3, reps: 8, restSeconds: 120, targetMuscles: ['hamstrings', 'glutes', 'back'], equipmentNeeded: ['barbell'], instructions: 'Hip hinge movement, keep bar close to body' },
        { name: 'Lunges', type: ExerciseType.STRENGTH, sets: 3, reps: 12, restSeconds: 60, targetMuscles: ['quads', 'glutes'], equipmentNeeded: ['dumbbells'], instructions: 'Step forward, lower back knee to ground' },
      ],
      cardio: [
        { name: 'High Knees', type: ExerciseType.CARDIO, durationSeconds: 30, restSeconds: 30, targetMuscles: ['cardio'], equipmentNeeded: [], instructions: 'Bring knees to chest height rapidly' },
        { name: 'Burpees', type: ExerciseType.PLYOMETRIC, sets: 3, reps: 10, restSeconds: 60, targetMuscles: ['full body'], equipmentNeeded: [], instructions: 'Squat, jump back, push-up, jump forward, jump up' },
        { name: 'Mountain Climbers', type: ExerciseType.CARDIO, durationSeconds: 45, restSeconds: 15, targetMuscles: ['core', 'cardio'], equipmentNeeded: [], instructions: 'Alternate bringing knees to chest in plank position' },
      ],
    };

    const selectedExercises = [];
    
    for (const area of focusAreas) {
      const areaExercises = exerciseDatabase[area] || exerciseDatabase.cardio;
      const exerciseCount = difficulty === ProgramDifficulty.BEGINNER ? 2 : 
                           difficulty === ProgramDifficulty.INTERMEDIATE ? 3 : 4;
      
      for (let i = 0; i < Math.min(exerciseCount, areaExercises.length); i++) {
        const exercise = { ...areaExercises[i] };
        
        // Adjust difficulty
        if (difficulty === ProgramDifficulty.BEGINNER) {
          exercise.sets = Math.max(2, (exercise.sets || 3) - 1);
          exercise.reps = Math.max(8, (exercise.reps || 10) - 2);
        } else if (difficulty === ProgramDifficulty.ADVANCED) {
          exercise.sets = (exercise.sets || 3) + 1;
          exercise.reps = (exercise.reps || 10) + 2;
        }
        
        selectedExercises.push(exercise);
      }
    }

    return selectedExercises;
  }

  private getWarmUpInstructions(focusAreas: string[]): string {
    return `5-10 minutes of light cardio followed by dynamic stretching targeting ${focusAreas.join(', ')}`;
  }

  private getCoolDownInstructions(): string {
    return '5-10 minutes of static stretching and light walking to cool down';
  }

  async assignProgramToUser(programId: number, userId: number, coachId: number): Promise<void> {
    const program = await this.trainingProgramRepository.findOne({
      where: { id: programId, coachId },
    });

    if (!program) {
      throw new NotFoundException('Training program not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.trainingProgramRepository.update(programId, { userId });
  }

  async getUserTrainingPrograms(userId: number): Promise<TrainingProgram[]> {
    return this.trainingProgramRepository.find({
      where: { userId },
      relations: ['coach', 'coach.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTrainingProgramDetails(programId: number): Promise<TrainingProgram> {
    return this.trainingProgramRepository.findOne({
      where: { id: programId },
      relations: [
        'trainingDays',
        'trainingDays.exercises',
        'trainingDays.exercises.media',
        'coach',
        'coach.user'
      ],
      order: {
        trainingDays: {
          dayNumber: 'ASC',
        },
      },
    });
  }

  async getCoachPrograms(coachId: number): Promise<TrainingProgram[]> {
    return this.trainingProgramRepository.find({
      where: { coachId },
      relations: ['assignedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPublicPrograms(
    type?: ProgramType,
    difficulty?: ProgramDifficulty
  ): Promise<TrainingProgram[]> {
    const query = this.trainingProgramRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.coach', 'coach')
      .leftJoinAndSelect('coach.user', 'user')
      .where('program.isPublic = :isPublic', { isPublic: true })
      .andWhere('program.isActive = :isActive', { isActive: true });

    if (type) {
      query.andWhere('program.type = :type', { type });
    }

    if (difficulty) {
      query.andWhere('program.difficulty = :difficulty', { difficulty });
    }

    return query.orderBy('program.rating', 'DESC').getMany();
  }

  async updateExerciseMedia(exerciseId: number, mediaId: number): Promise<void> {
    // Update the exercise to reference the media
    const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
    if (exercise) {
      // Since we have a OneToMany relationship, we don't update mediaId directly
      // Instead, the media entity should reference the exercise
      // This method can be used to associate media with exercises through the Media entity
    }
  }
}
