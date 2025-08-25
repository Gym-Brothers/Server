import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthMetrics } from '../entities/health-metrics.entity';
import { MedicalHistory } from '../entities/medical-history.entity';
import { FitnessGoals } from '../entities/fitness-goals.entity';
import { User } from '../entities/user.entity';
import { CreateHealthMetricsDto, UpdateHealthMetricsDto, CreateMedicalHistoryDto, UpdateMedicalHistoryDto, HealthAssessmentDto } from '../dto/health/health.dto';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthMetrics)
    private healthMetricsRepository: Repository<HealthMetrics>,
    @InjectRepository(MedicalHistory)
    private medicalHistoryRepository: Repository<MedicalHistory>,
    @InjectRepository(FitnessGoals)
    private fitnessGoalsRepository: Repository<FitnessGoals>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createHealthMetrics(userId: number, createMetricsDto: CreateHealthMetricsDto): Promise<HealthMetrics> {
    // Calculate BMI automatically
    const bmi = createMetricsDto.weight / Math.pow(createMetricsDto.height / 100, 2);
    
    const healthMetrics = this.healthMetricsRepository.create({
      userId,
      ...createMetricsDto,
      bmi: Math.round(bmi * 100) / 100,
    });

    return this.healthMetricsRepository.save(healthMetrics);
  }

  async getHealthMetrics(userId: number): Promise<HealthMetrics[]> {
    return this.healthMetricsRepository.find({
      where: { userId },
      order: { recordedAt: 'DESC' },
    });
  }

  async updateHealthMetrics(id: number, userId: number, updateMetricsDto: UpdateHealthMetricsDto): Promise<HealthMetrics> {
    const metrics = await this.healthMetricsRepository.findOne({
      where: { id, userId },
    });

    if (!metrics) {
      throw new NotFoundException('Health metrics not found');
    }

    // Recalculate BMI if height or weight changed
    let bmi = metrics.bmi;
    if (updateMetricsDto.height || updateMetricsDto.weight) {
      const height = updateMetricsDto.height || metrics.height;
      const weight = updateMetricsDto.weight || metrics.weight;
      bmi = weight / Math.pow(height / 100, 2);
    }

    Object.assign(metrics, updateMetricsDto, { bmi: Math.round(bmi * 100) / 100 });
    return this.healthMetricsRepository.save(metrics);
  }

  async createMedicalHistory(userId: number, medicalHistoryDto: CreateMedicalHistoryDto): Promise<MedicalHistory> {
    // Check if medical history already exists for user
    const existing = await this.medicalHistoryRepository.findOne({
      where: { userId },
    });

    if (existing) {
      // Update existing medical history
      Object.assign(existing, medicalHistoryDto);
      return this.medicalHistoryRepository.save(existing);
    }

    const medicalHistory = this.medicalHistoryRepository.create({
      userId,
      ...medicalHistoryDto,
    });

    return this.medicalHistoryRepository.save(medicalHistory);
  }

  async getMedicalHistory(userId: number): Promise<MedicalHistory | null> {
    return this.medicalHistoryRepository.findOne({
      where: { userId },
    });
  }

  async updateMedicalHistory(userId: number, updateMedicalDto: UpdateMedicalHistoryDto): Promise<MedicalHistory> {
    const medicalHistory = await this.medicalHistoryRepository.findOne({
      where: { userId },
    });

    if (!medicalHistory) {
      throw new NotFoundException('Medical history not found');
    }

    Object.assign(medicalHistory, updateMedicalDto);
    return this.medicalHistoryRepository.save(medicalHistory);
  }

  async createHealthAssessment(userId: number, assessmentDto: HealthAssessmentDto): Promise<any> {
    // Create health metrics from assessment
    const healthMetrics = await this.createHealthMetrics(userId, {
      height: assessmentDto.height,
      weight: assessmentDto.weight,
      bodyFatPercentage: assessmentDto.bodyFatPercentage,
      muscleMass: assessmentDto.muscleMass,
      bloodPressureSystolic: assessmentDto.bloodPressureSystolic,
      bloodPressureDiastolic: assessmentDto.bloodPressureDiastolic,
      restingHeartRate: assessmentDto.restingHeartRate,
      notes: assessmentDto.notes,
    });

    // Update or create medical history
    if (assessmentDto.bloodType || assessmentDto.allergies || assessmentDto.medications || assessmentDto.chronicConditions) {
      await this.createMedicalHistory(userId, {
        bloodType: assessmentDto.bloodType,
        allergies: assessmentDto.allergies || [],
        medications: assessmentDto.medications || [],
        chronicConditions: assessmentDto.chronicConditions || [],
        pastSurgeries: [],
        injuries: assessmentDto.injuries || [],
      });
    }

    // Generate recommendations based on assessment
    const recommendations = this.generateRecommendations(assessmentDto);

    return {
      healthMetrics,
      recommendations,
      assessmentScore: this.calculateAssessmentScore(assessmentDto),
    };
  }

  async getHealthDashboard(userId: number): Promise<any> {
    const latestMetrics = await this.healthMetricsRepository.findOne({
      where: { userId },
      order: { recordedAt: 'DESC' },
    });

    const recentMetrics = await this.healthMetricsRepository.find({
      where: { userId },
      order: { recordedAt: 'DESC' },
      take: 5,
    });

    const fitnessGoals = await this.fitnessGoalsRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    return {
      summary: {
        currentWeight: latestMetrics?.weight || 0,
        goalWeight: fitnessGoals[0]?.targetWeight || null,
        bmi: latestMetrics?.bmi || 0,
        lastWorkout: null, // TODO: implement workout tracking
        weeklyProgress: this.calculateWeeklyProgress(recentMetrics),
      },
      recentMetrics: recentMetrics.map(metric => ({
        date: metric.recordedAt,
        weight: metric.weight,
        bodyFat: metric.bodyFatPercentage,
        bmi: metric.bmi,
      })),
      healthAlerts: this.generateHealthAlerts(latestMetrics, fitnessGoals),
    };
  }

  private generateRecommendations(assessment: HealthAssessmentDto): string[] {
    const recommendations = [];
    
    // BMI-based recommendations
    const bmi = assessment.weight / Math.pow(assessment.height / 100, 2);
    if (bmi < 18.5) {
      recommendations.push('Consider consulting a nutritionist for healthy weight gain strategies');
    } else if (bmi > 25) {
      recommendations.push('Focus on cardiovascular exercises and balanced nutrition for weight management');
    }

    // Blood pressure recommendations
    if (assessment.bloodPressureSystolic && assessment.bloodPressureSystolic > 140) {
      recommendations.push('Monitor blood pressure regularly and consult healthcare provider');
    }

    // Fitness level recommendations
    if (assessment.fitnessLevel < 5) {
      recommendations.push('Start with low-intensity exercises and gradually increase activity level');
    } else if (assessment.fitnessLevel > 7) {
      recommendations.push('Consider advanced training programs and sports performance coaching');
    }

    return recommendations;
  }

  private calculateAssessmentScore(assessment: HealthAssessmentDto): number {
    // Simple scoring algorithm based on fitness metrics
    let score = 0;
    
    score += assessment.fitnessLevel * 10;
    score += (assessment.strengthScore || 5) * 5;
    score += (assessment.enduranceScore || 5) * 5;
    score += (assessment.flexibilityScore || 5) * 5;
    
    return Math.min(score, 100);
  }

  private calculateWeeklyProgress(metrics: HealthMetrics[]): string {
    if (metrics.length < 2) return '0%';
    
    const latest = metrics[0];
    const previous = metrics[metrics.length - 1];
    
    // Simple progress calculation based on weight change
    const weightChange = Math.abs(latest.weight - previous.weight);
    const progressPercentage = Math.min((weightChange / previous.weight) * 100 * 10, 100);
    
    return `${Math.round(progressPercentage)}%`;
  }

  private generateHealthAlerts(latestMetrics: HealthMetrics | undefined, goals: FitnessGoals[]): string[] {
    const alerts = [];
    
    if (!latestMetrics) {
      alerts.push('No recent health metrics recorded');
      return alerts;
    }

    // Check if metrics are outdated
    const daysSinceLastRecord = Math.floor(
      (Date.now() - latestMetrics.recordedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastRecord > 7) {
      alerts.push('Update your health metrics - last recorded ' + daysSinceLastRecord + ' days ago');
    }

    // Check blood pressure alerts
    if (latestMetrics.bloodPressureSystolic && latestMetrics.bloodPressureSystolic > 140) {
      alerts.push('High blood pressure detected - consult healthcare provider');
    }

    // Check goal progress
    if (goals.length === 0) {
      alerts.push('Set your fitness goals to track progress');
    }

    return alerts;
  }
}
