import { Controller, Get, Post, Put, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { CoachService } from './coach.service';
import { CreateCoachDto, UpdateCoachProfileDto, CreateCertificationDto } from '../dto/coach/coach.dto';

@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Public()
  @Get('search')
  async searchCoaches(
    @Query('specialization') specialization?: string, 
    @Query('rating') minRating?: string
  ) {
    try {
      const coaches = await this.coachService.searchCoaches(
        specialization,
        minRating ? parseFloat(minRating) : undefined
      );

      return {
        message: 'Coaches retrieved successfully',
        data: coaches,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: coaches.length,
        }
      };
    } catch (error) {
      throw new Error('Failed to search coaches: ' + error.message);
    }
  }

  @Public()
  @Get(':id')
  async getCoachProfile(@Param('id') id: string) {
    try {
      const coach = await this.coachService.getCoachProfile(parseInt(id));
      
      return {
        message: 'Coach profile retrieved successfully',
        data: coach,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to retrieve coach profile: ' + error.message);
    }
  }

  @Post('register')
  async registerAsCoach(@CurrentUser() user: any, @Body() coachDto: CreateCoachDto) {
    try {
      const coach = await this.coachService.registerAsCoach(user.id, coachDto);
      
      return {
        message: 'Coach registration submitted successfully',
        data: {
          userId: user.id,
          coachId: coach.id,
          status: 'pending_verification',
          submittedAt: new Date().toISOString(),
        }
      };
    } catch (error) {
      throw new Error('Failed to register as coach: ' + error.message);
    }
  }

  @Get('profile/me')
  async getMyCoachProfile(@CurrentUser() user: any) {
    try {
      const coach = await this.coachService.getMyCoachProfile(user.id);
      
      return {
        message: 'Coach profile retrieved successfully',
        data: coach,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to retrieve coach profile: ' + error.message);
    }
  }

  @Put('profile')
  async updateCoachProfile(@CurrentUser() user: any, @Body() updateDto: UpdateCoachProfileDto) {
    try {
      const updatedCoach = await this.coachService.updateCoachProfile(user.id, updateDto);
      
      return {
        message: 'Coach profile updated successfully',
        data: updatedCoach,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to update coach profile: ' + error.message);
    }
  }

  @Get('clients')
  async getMyClients(@CurrentUser() user: any) {
    try {
      // First get the coach profile to get coachId
      const coach = await this.coachService.getMyCoachProfile(user.id);
      const clients = await this.coachService.getMyClients(coach.id);
      
      return {
        message: 'Clients retrieved successfully',
        data: clients,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to retrieve clients: ' + error.message);
    }
  }

  @Get('clients/:clientId/profile')
  async getClientProfile(@CurrentUser() user: any, @Param('clientId') clientId: string) {
    try {
      // First get the coach profile to get coachId
      const coach = await this.coachService.getMyCoachProfile(user.id);
      const clientProfile = await this.coachService.getClientProfile(coach.id, parseInt(clientId));
      
      return {
        message: 'Client profile retrieved successfully',
        data: clientProfile,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to retrieve client profile: ' + error.message);
    }
  }

  @Post('certifications')
  async addCertification(@CurrentUser() user: any, @Body() certificationDto: CreateCertificationDto) {
    try {
      // First get the coach profile to get coachId
      const coach = await this.coachService.getMyCoachProfile(user.id);
      const certification = await this.coachService.addCertification(coach.id, certificationDto);
      
      return {
        message: 'Certification added successfully',
        data: certification,
      };
    } catch (error) {
      throw new Error('Failed to add certification: ' + error.message);
    }
  }

  @Get('reviews')
  async getMyReviews(@CurrentUser() user: any) {
    try {
      // First get the coach profile to get coachId
      const coach = await this.coachService.getMyCoachProfile(user.id);
      const reviews = await this.coachService.getMyReviews(coach.id);
      
      return {
        message: 'Reviews retrieved successfully',
        ...reviews,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to retrieve reviews: ' + error.message);
    }
  }
}
