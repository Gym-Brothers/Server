import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { RealtimeService } from '../services/realtime.service';
import { AsyncOperationsService } from '../services/async-operations.service';
import { Subscription } from '../entities/subscription.entity';
import { HealthMetrics } from '../entities/health-metrics.entity';
import { Coach } from '../entities/coach.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Subscription, HealthMetrics, Coach]),
  ],
  controllers: [UserController],
  providers: [UserService, RealtimeService, AsyncOperationsService],
  exports: [UserService, RealtimeService, AsyncOperationsService],
})
export class UserModule {}
