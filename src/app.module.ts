import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';
import { CoachModule } from './coach/coach.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { MediaModule } from './media/media.module';
import { InBodyModule } from './inbody/inbody.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { TrainingProgramModule } from './training-program/training-program.module';
import { SearchModule } from './search/search.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Import all entities
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { HealthMetrics } from './entities/health-metrics.entity';
import { MedicalHistory } from './entities/medical-history.entity';
import { FitnessGoals } from './entities/fitness-goals.entity';
import { Coach } from './entities/coach.entity';
import { CoachCertification } from './entities/coach-certification.entity';
import { CoachSpecialization } from './entities/coach-specialization.entity';
import { Subscription } from './entities/subscription.entity';
import { InBodyTest } from './entities/inbody-test.entity';
import { TrainingProgram } from './entities/training-program.entity';
import { TrainingDay } from './entities/training-day.entity';
import { Exercise } from './entities/exercise.entity';
import { Media } from './entities/media.entity';
import { NutritionPlan } from './entities/nutrition-plan.entity';
import { NutritionDay } from './entities/nutrition-day.entity';
import { Meal } from './entities/meal.entity';
import { FoodItem } from './entities/food-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [
          User,
          Address,
          EmergencyContact,
          HealthMetrics,
          MedicalHistory,
          FitnessGoals,
          Coach,
          CoachCertification,
          CoachSpecialization,
          Subscription,
          InBodyTest,
          TrainingProgram,
          TrainingDay,
          Exercise,
          Media,
          NutritionPlan,
          NutritionDay,
          Meal,
          FoodItem,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    HealthModule,
    CoachModule,
    SubscriptionModule,
    MediaModule,
    InBodyModule,
    NutritionModule,
    TrainingProgramModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
