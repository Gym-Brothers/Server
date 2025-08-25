import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { TrainingProgramService } from '../services/training-program.service';
import { ProgramDifficulty, ProgramType } from '../entities/training-program.entity';

@Controller('api/training')
@UseGuards(JwtAuthGuard)
export class TrainingProgramController {
  constructor(private readonly trainingProgramService: TrainingProgramService) {}

  @Post('program')
  async createTrainingProgram(
    @CurrentUser() user: any,
    @Body() programData: {
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
    },
  ) {
    return this.trainingProgramService.createTrainingProgram(
      user.coach.id,
      programData,
    );
  }

  @Get('programs')
  async getUserTrainingPrograms(@CurrentUser() user: any) {
    return this.trainingProgramService.getUserTrainingPrograms(user.id);
  }

  @Get('coach/programs')
  async getCoachPrograms(@CurrentUser() user: any) {
    return this.trainingProgramService.getCoachPrograms(user.coach.id);
  }

  @Get('programs/public')
  async getPublicPrograms(
    @Query('type') type?: ProgramType,
    @Query('difficulty') difficulty?: ProgramDifficulty,
  ) {
    return this.trainingProgramService.getPublicPrograms(type, difficulty);
  }

  @Get('program/:programId')
  async getTrainingProgramDetails(@Param('programId', ParseIntPipe) programId: number) {
    return this.trainingProgramService.getTrainingProgramDetails(programId);
  }

  @Put('program/:programId/assign/:userId')
  async assignProgramToUser(
    @Param('programId', ParseIntPipe) programId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: any,
  ) {
    await this.trainingProgramService.assignProgramToUser(
      programId,
      userId,
      user.coach.id,
    );
    return { success: true };
  }

  @Get('program/:programId/day/:dayNumber')
  async getDailyWorkout(
    @Param('programId', ParseIntPipe) programId: number,
    @Param('dayNumber', ParseIntPipe) dayNumber: number,
  ) {
    const program = await this.trainingProgramService.getTrainingProgramDetails(programId);
    const day = program.trainingDays.find(d => d.dayNumber === dayNumber);
    
    return {
      day,
      summary: {
        exerciseCount: day.exercises.length,
        estimatedDuration: day.estimatedDurationMinutes,
        focusAreas: day.focusAreas,
        isRestDay: day.restDay,
      },
      warmUp: day.warmUpInstructions,
      coolDown: day.coolDownInstructions,
      exercises: day.exercises.map(exercise => ({
        ...exercise,
        media: exercise.media || [],
      })),
    };
  }

  @Get('program/:programId/week/:weekNumber')
  async getWeeklyWorkout(
    @Param('programId', ParseIntPipe) programId: number,
    @Param('weekNumber', ParseIntPipe) weekNumber: number,
  ) {
    const program = await this.trainingProgramService.getTrainingProgramDetails(programId);
    const weekDays = program.trainingDays.filter(d => d.weekNumber === weekNumber);
    
    return {
      weekNumber,
      days: weekDays,
      weekSummary: {
        workoutDays: weekDays.filter(d => !d.restDay).length,
        restDays: weekDays.filter(d => d.restDay).length,
        totalExercises: weekDays.reduce((sum, day) => sum + day.exercises.length, 0),
        avgDuration: weekDays.reduce((sum, day) => sum + day.estimatedDurationMinutes, 0) / weekDays.length,
        focusAreas: [...new Set(weekDays.flatMap(d => d.focusAreas))],
      },
    };
  }

  @Get('program/:programId/progress/:userId')
  async getUserProgress(
    @Param('programId', ParseIntPipe) programId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    // This would integrate with a workout tracking system
    return {
      programId,
      userId,
      completedDays: 0,
      totalDays: 0,
      currentWeek: 1,
      lastWorkout: null,
      nextWorkout: null,
      streak: 0,
    };
  }
}
