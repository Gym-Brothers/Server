import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MediaController } from '../controllers/media.controller';
import { MediaService } from '../services/media.service';
import { S3Service } from '../services/s3.service';
import { Media } from '../entities/media.entity';
import { Coach } from '../entities/coach.entity';
import { Exercise } from '../entities/exercise.entity';
import { TrainingProgram } from '../entities/training-program.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, Coach, Exercise, TrainingProgram]),
    ConfigModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, S3Service],
  exports: [MediaService, S3Service],
})
export class MediaModule {}
