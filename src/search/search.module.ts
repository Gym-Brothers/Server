import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from '../controllers/search.controller';
import { Coach } from '../entities/coach.entity';
import { TrainingProgram } from '../entities/training-program.entity';
import { Media } from '../entities/media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coach, TrainingProgram, Media])],
  controllers: [SearchController],
})
export class SearchModule {}
