import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { HealthService } from './health.service';
import { CreateHealthMetricsDto, UpdateHealthMetricsDto, CreateMedicalHistoryDto, UpdateMedicalHistoryDto, HealthAssessmentDto } from '../dto/health/health.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  
  @Post('metrics')
  async createHealthMetrics(@CurrentUser() user: any, @Body() createMetricsDto: CreateHealthMetricsDto) {
    try {
      const healthMetrics = await this.healthService.createHealthMetrics(user.id, createMetricsDto);
      
      return {
        message: 'Health metrics recorded successfully',
        data: healthMetrics,
      };
    } catch (error) {
      throw new Error('Failed to record health metrics: ' + error.message);
    }
  }

  @Get('metrics')
  async getHealthMetrics(@CurrentUser() user: any) {
    const metrics = await this.healthService.getHealthMetrics(user.id);
    
    return {
      message: 'Health metrics retrieved successfully',
      data: {
        userId: user.id,
        metrics,
        totalRecords: metrics.length,
      }
    };
  }

  @Put('metrics/:id')
  async updateHealthMetrics(
    @CurrentUser() user: any,
    @Param('id') id: string, 
    @Body() updateMetricsDto: UpdateHealthMetricsDto
  ) {
    try {
      const updatedMetrics = await this.healthService.updateHealthMetrics(
        parseInt(id), 
        user.id, 
        updateMetricsDto
      );
      
      return {
        message: 'Health metrics updated successfully',
        data: updatedMetrics,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to update health metrics: ' + error.message);
    }
  }

  @Post('medical-history')
  async createMedicalHistory(@CurrentUser() user: any, @Body() medicalHistoryDto: CreateMedicalHistoryDto) {
    try {
      const medicalHistory = await this.healthService.createMedicalHistory(user.id, medicalHistoryDto);
      
      return {
        message: 'Medical history recorded successfully',
        data: medicalHistory,
      };
    } catch (error) {
      throw new Error('Failed to record medical history: ' + error.message);
    }
  }

  @Get('medical-history')
  async getMedicalHistory(@CurrentUser() user: any) {
    const medicalHistory = await this.healthService.getMedicalHistory(user.id);
    
    if (!medicalHistory) {
      return {
        message: 'No medical history found',
        data: null,
      };
    }

    return {
      message: 'Medical history retrieved successfully',
      data: medicalHistory,
    };
  }

  @Put('medical-history')
  async updateMedicalHistory(@CurrentUser() user: any, @Body() updateMedicalDto: UpdateMedicalHistoryDto) {
    try {
      const updatedHistory = await this.healthService.updateMedicalHistory(user.id, updateMedicalDto);
      
      return {
        message: 'Medical history updated successfully',
        data: updatedHistory,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to update medical history: ' + error.message);
    }
  }

  @Post('assessment')
  async createHealthAssessment(@CurrentUser() user: any, @Body() assessmentDto: HealthAssessmentDto) {
    try {
      const assessment = await this.healthService.createHealthAssessment(user.id, assessmentDto);
      
      return {
        message: 'Health assessment completed successfully',
        data: {
          userId: user.id,
          assessmentId: assessment.healthMetrics.id,
          ...assessment,
          completedAt: new Date().toISOString(),
        }
      };
    } catch (error) {
      throw new Error('Failed to complete health assessment: ' + error.message);
    }
  }

  @Get('dashboard')
  async getHealthDashboard(@CurrentUser() user: any) {
    try {
      const dashboardData = await this.healthService.getHealthDashboard(user.id);
      
      return {
        message: 'Health dashboard data retrieved successfully',
        data: {
          userId: user.id,
          ...dashboardData,
        }
      };
    } catch (error) {
      throw new Error('Failed to retrieve dashboard data: ' + error.message);
    }
  }
}
