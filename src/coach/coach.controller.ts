import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { CoachService } from './coach.service';
import { 
  CreateCoachDto, 
  UpdateCoachProfileDto, 
  CreateCertificationDto,
  AddSpecializationDto,
  UpdateSpecializationDto,
  CoachReviewDto 
} from '../dto/coach/coach.dto';

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

  // NEW: Specialization management endpoints
  @Get(':id/specializations')
  async getCoachSpecializations(@Param('id') id: string) {
    try {
      const specializations = await this.coachService.getCoachSpecializations(parseInt(id));
      
      return {
        message: 'Coach specializations retrieved successfully',
        data: specializations,
      };
    } catch (error) {
      throw new Error('Failed to retrieve specializations: ' + error.message);
    }
  }

  @Post('specializations')
  async addSpecialization(@CurrentUser() user: any, @Body() specializationDto: AddSpecializationDto) {
    try {
      // Get coach profile first to get coachId
      const coach = await this.coachService.getMyCoachProfile(user.id);
      const specialization = await this.coachService.addSpecialization(coach.id, specializationDto);
      
      return {
        message: 'Specialization added successfully',
        data: specialization,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to add specialization: ' + error.message);
    }
  }

  @Put('specializations/:specializationId')
  async updateSpecialization(
    @CurrentUser() user: any, 
    @Param('specializationId') specializationId: string,
    @Body() updateDto: UpdateSpecializationDto
  ) {
    try {
      const coach = await this.coachService.getMyCoachProfile(user.id);
      const updatedSpecialization = await this.coachService.updateSpecialization(
        coach.id, 
        parseInt(specializationId), 
        updateDto
      );
      
      return {
        message: 'Specialization updated successfully',
        data: updatedSpecialization,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to update specialization: ' + error.message);
    }
  }

  @Delete('specializations/:specializationId')
  async removeSpecialization(
    @CurrentUser() user: any, 
    @Param('specializationId') specializationId: string
  ) {
    try {
      const coach = await this.coachService.getMyCoachProfile(user.id);
      const result = await this.coachService.removeSpecialization(coach.id, parseInt(specializationId));
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to remove specialization: ' + error.message);
    }
  }

  // NEW: Review management endpoints
  @Post(':id/reviews')
  async addReview(
    @CurrentUser() user: any,
    @Param('id') coachId: string,
    @Body() reviewDto: CoachReviewDto
  ) {
    try {
      // Set the clientId from the current user
      reviewDto.clientId = user.id;
      
      const result = await this.coachService.addReview(parseInt(coachId), reviewDto);
      
      return {
        message: 'Review added successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to add review: ' + error.message);
    }
  }

  @Get('profile/reviews')
  async getMyReviews(@CurrentUser() user: any) {
    try {
      const coach = await this.coachService.getMyCoachProfile(user.id);
      const reviews = await this.coachService.getMyReviews(coach.id);
      
      return {
        message: 'Reviews retrieved successfully',
        data: reviews,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to retrieve reviews: ' + error.message);
    }
  }

  // NEW: Certification management endpoint
  @Post('certifications')
  async addCertification(@CurrentUser() user: any, @Body() certificationDto: CreateCertificationDto) {
    try {
      const coach = await this.coachService.getMyCoachProfile(user.id);
      const certification = await this.coachService.addCertification(coach.id, certificationDto);
      
      return {
        message: 'Certification added successfully',
        data: certification,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to add certification: ' + error.message);
    }
  }
}
