import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingProgramController } from '../controllers/training-program.controller';
import { TrainingProgramService } from '../services/training-program.service';
import { TrainingProgram } from '../entities/training-program.entity';
import { TrainingDay } from '../entities/training-day.entity';
import { Exercise } from '../entities/exercise.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingProgram, TrainingDay, Exercise, User]),
  ],
  controllers: [TrainingProgramController],
  providers: [TrainingProgramService],
  exports: [TrainingProgramService],
})
export class TrainingProgramModule {}
