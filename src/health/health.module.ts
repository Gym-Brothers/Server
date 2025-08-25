import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthMetrics } from '../entities/health-metrics.entity';
import { MedicalHistory } from '../entities/medical-history.entity';
import { FitnessGoals } from '../entities/fitness-goals.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HealthMetrics,
      MedicalHistory,
      FitnessGoals,
      User,
    ]),
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
