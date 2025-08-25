import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';
import { Coach } from '../entities/coach.entity';
import { CoachCertification } from '../entities/coach-certification.entity';
import { CoachSpecialization } from '../entities/coach-specialization.entity';
import { User } from '../entities/user.entity';
import { Subscription } from '../entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Coach,
      CoachCertification,
      CoachSpecialization,
      User,
      Subscription,
    ]),
  ],
  controllers: [CoachController],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}
