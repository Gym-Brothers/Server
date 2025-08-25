import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { TrainingProgram } from '../entities/training-program.entity';
import { Media } from '../entities/media.entity';

@Controller('api/search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
    @InjectRepository(TrainingProgram)
    private trainingProgramRepository: Repository<TrainingProgram>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  @Get('coaches')
  async searchCoaches(
    @Query('query') query: string,
    @Query('specialization') specialization?: string,
    @Query('minRating') minRating?: number,
    @Query('maxRate') maxRate?: number,
  ) {
    const queryBuilder = this.coachRepository
      .createQueryBuilder('coach')
      .leftJoinAndSelect('coach.user', 'user')
      .leftJoinAndSelect('coach.specializations', 'specializations')
      .leftJoinAndSelect('coach.certifications', 'certifications')
      .where('coach.isVerified = :isVerified', { isVerified: true })
      .andWhere('coach.isAvailable = :isAvailable', { isAvailable: true });

    if (query) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :query OR user.lastName ILIKE :query OR coach.bio ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (specialization) {
      queryBuilder.andWhere('specializations.name = :specialization', { specialization });
    }

    if (minRating) {
      queryBuilder.andWhere('coach.averageRating >= :minRating', { minRating });
    }

    if (maxRate) {
      queryBuilder.andWhere('coach.hourlyRate <= :maxRate', { maxRate });
    }

    return queryBuilder
      .orderBy('coach.averageRating', 'DESC')
      .addOrderBy('coach.totalReviews', 'DESC')
      .getMany();
  }

  @Get('programs')
  async searchPrograms(
    @Query('query') query: string,
    @Query('type') type?: string,
    @Query('difficulty') difficulty?: string,
    @Query('maxPrice') maxPrice?: number,
  ) {
    const queryBuilder = this.trainingProgramRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.coach', 'coach')
      .leftJoinAndSelect('coach.user', 'user')
      .where('program.isPublic = :isPublic', { isPublic: true })
      .andWhere('program.isActive = :isActive', { isActive: true });

    if (query) {
      queryBuilder.andWhere(
        '(program.name ILIKE :query OR program.description ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (type) {
      queryBuilder.andWhere('program.type = :type', { type });
    }

    if (difficulty) {
      queryBuilder.andWhere('program.difficulty = :difficulty', { difficulty });
    }

    if (maxPrice) {
      queryBuilder.andWhere('program.price <= :maxPrice', { maxPrice });
    }

    return queryBuilder
      .orderBy('program.rating', 'DESC')
      .addOrderBy('program.totalRatings', 'DESC')
      .getMany();
  }

  @Get('media')
  async searchMedia(
    @Query('query') query: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
  ) {
    const queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.coach', 'coach')
      .leftJoinAndSelect('coach.user', 'user')
      .where('media.isPublic = :isPublic', { isPublic: true });

    if (query) {
      queryBuilder.andWhere(
        '(media.title ILIKE :query OR media.description ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (category) {
      queryBuilder.andWhere('media.category = :category', { category });
    }

    if (type) {
      queryBuilder.andWhere('media.type = :type', { type });
    }

    return queryBuilder
      .orderBy('media.viewCount', 'DESC')
      .addOrderBy('media.createdAt', 'DESC')
      .getMany();
  }

  @Get('all')
  async globalSearch(@Query('query') query: string) {
    const coaches = await this.searchCoaches(query);
    const programs = await this.searchPrograms(query);
    const media = await this.searchMedia(query);

    return {
      coaches: coaches.slice(0, 5),
      programs: programs.slice(0, 5),
      media: media.slice(0, 5),
      total: coaches.length + programs.length + media.length,
    };
  }
}
