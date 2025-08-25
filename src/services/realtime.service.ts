import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutSession, WorkoutStatus } from '../entities/workout-session.entity';
import { ExercisePerformance } from '../entities/exercise-performance.entity';
import { HealthAlert, HealthAlertType, AlertSeverity } from '../entities/health-alert.entity';
import { SmartGoal, GoalStatus } from '../entities/smart-goal.entity';

@Injectable()
export class RealtimeService {
  constructor(
    @InjectRepository(WorkoutSession)
    private workoutRepository: Repository<WorkoutSession>,
    @InjectRepository(ExercisePerformance)
    private performanceRepository: Repository<ExercisePerformance>,
    @InjectRepository(HealthAlert)
    private healthAlertRepository: Repository<HealthAlert>,
    @InjectRepository(SmartGoal)
    private smartGoalRepository: Repository<SmartGoal>,
  ) {}

  async startWorkout(userId: number, trainingDayId: number, trainingProgramId: number): Promise<WorkoutSession> {
    const session = this.workoutRepository.create({
      userId,
      trainingDayId,
      trainingProgramId,
      status: WorkoutStatus.IN_PROGRESS,
      scheduledDate: new Date(),
      startedAt: new Date(),
    });

    const savedSession = await this.workoutRepository.save(session);
    
    // Emit real-time event
    this.emitWorkoutEvent('workout_started', {
      userId,
      sessionId: savedSession.id,
      timestamp: new Date(),
    });

    return savedSession;
  }

  async completeWorkout(sessionId: number, performanceData: any): Promise<void> {
    const session = await this.workoutRepository.findOne({ where: { id: sessionId } });
    if (!session) throw new Error('Workout session not found');

    const completedAt = new Date();
    const durationMinutes = Math.round((completedAt.getTime() - session.startedAt.getTime()) / (1000 * 60));

    await this.workoutRepository.update(sessionId, {
      status: WorkoutStatus.COMPLETED,
      completedAt,
      durationMinutes,
      caloriesBurned: performanceData.totalCalories,
      difficultyRating: performanceData.difficultyRating,
      satisfactionRating: performanceData.satisfactionRating,
    });

    // Check for achievements and health alerts
    await this.checkForAchievements(session.userId);
    await this.analyzeHealthMetrics(session.userId, performanceData);

    this.emitWorkoutEvent('workout_completed', {
      userId: session.userId,
      sessionId,
      duration: durationMinutes,
      calories: performanceData.totalCalories,
    });
  }

  async logExercisePerformance(data: {
    workoutSessionId: number;
    exerciseId: number;
    setNumber: number;
    reps?: number;
    weightKg?: number;
    durationSeconds?: number;
    rpeScale?: number;
  }): Promise<ExercisePerformance> {
    const performance = this.performanceRepository.create(data);
    
    // AI Form Analysis
    performance.formFeedback = await this.analyzeFormWithAI(data);
    
    // Check for Personal Records
    performance.isPersonalRecord = await this.checkPersonalRecord(data);

    const savedPerformance = await this.performanceRepository.save(performance);

    this.emitWorkoutEvent('exercise_completed', {
      sessionId: data.workoutSessionId,
      exerciseId: data.exerciseId,
      isPersonalRecord: performance.isPersonalRecord,
      formScore: performance.formFeedback?.aiScore,
    });

    return savedPerformance;
  }

  async createHealthAlert(userId: number, type: HealthAlertType, data: any): Promise<HealthAlert> {
    const alert = this.healthAlertRepository.create({
      userId,
      type,
      severity: this.calculateSeverity(type, data),
      title: this.generateAlertTitle(type),
      description: this.generateAlertDescription(type, data),
      healthData: data,
      recommendations: this.generateRecommendations(type, data),
      requiresMedicalAttention: this.requiresMedicalAttention(type, data),
    });

    const savedAlert = await this.healthAlertRepository.save(alert);

    // Notify coach if critical
    if (alert.severity === AlertSeverity.CRITICAL || alert.requiresMedicalAttention) {
      this.notifyCoach(userId, alert);
    }

    this.emitHealthEvent('health_alert', {
      userId,
      alertId: savedAlert.id,
      severity: alert.severity,
      type: alert.type,
    });

    return savedAlert;
  }

  async updateGoalProgress(userId: number, goalId: number, newValue: number): Promise<void> {
    const goal = await this.smartGoalRepository.findOne({ where: { id: goalId, userId } });
    if (!goal) return;

    const previousValue = goal.currentValue;
    goal.currentValue = newValue;

    // Check milestone achievements
    const achievedMilestones = goal.milestones.filter(
      m => !m.achieved && newValue >= m.value
    );

    achievedMilestones.forEach(milestone => {
      milestone.achieved = true;
      milestone.achievedDate = new Date();
    });

    // Update AI insights
    goal.aiInsights = await this.generateAIInsights(goal);

    // Check if goal is completed
    if (newValue >= goal.targetValue && goal.status === GoalStatus.ACTIVE) {
      goal.status = GoalStatus.COMPLETED;
      this.emitGoalEvent('goal_completed', { userId, goalId, finalValue: newValue });
    }

    await this.smartGoalRepository.save(goal);

    this.emitGoalEvent('goal_progress', {
      userId,
      goalId,
      previousValue,
      newValue,
      progressPercentage: (newValue / goal.targetValue) * 100,
      achievedMilestones: achievedMilestones.length,
    });
  }

  updateSubscriptionStatus(userId: number, event: string, data: any): void {
    this.emitSubscriptionEvent('subscription_update', {
      userId,
      event,
      data,
      timestamp: new Date(),
    });
  }

  monitorHealthMetrics(userId: number): any {
    // Return observable for real-time health monitoring
    return {
      subscribe: (callback: any) => {
        // Implementation for real-time health metric monitoring
        console.log(`Monitoring health metrics for user ${userId}`);
        return { unsubscribe: () => {} };
      }
    };
  }

  getSubscriptionUpdates(userId: number): any {
    // Return observable for subscription updates
    return {
      subscribe: (callback: any) => {
        // Implementation for real-time subscription updates
        console.log(`Getting subscription updates for user ${userId}`);
        return { unsubscribe: () => {} };
      }
    };
  }

  private async analyzeFormWithAI(data: any): Promise<any> {
    // AI form analysis simulation
    return {
      aiScore: Math.floor(Math.random() * 40) + 60, // 60-100 score
      suggestions: [
        'Keep your back straight',
        'Control the movement on the way down',
        'Engage your core throughout the movement'
      ],
    };
  }

  private async checkPersonalRecord(data: any): Promise<boolean> {
    // Check if this is a personal record
    const previousBest = await this.performanceRepository
      .createQueryBuilder('performance')
      .where('performance.exerciseId = :exerciseId', { exerciseId: data.exerciseId })
      .andWhere('performance.workoutSession.userId = (SELECT ws.userId FROM workout_sessions ws WHERE ws.id = :sessionId)', 
        { sessionId: data.workoutSessionId })
      .orderBy('performance.weightKg', 'DESC')
      .addOrderBy('performance.reps', 'DESC')
      .getOne();

    if (!previousBest) return true;

    return (data.weightKg || 0) > (previousBest.weightKg || 0) || 
           (data.reps || 0) > (previousBest.reps || 0);
  }

  private calculateSeverity(type: HealthAlertType, data: any): AlertSeverity {
    switch (type) {
      case HealthAlertType.HEART_RATE_ANOMALY:
        return data.value > 180 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;
      case HealthAlertType.BLOOD_PRESSURE_HIGH:
        return data.systolic > 160 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM;
      default:
        return AlertSeverity.MEDIUM;
    }
  }

  private generateAlertTitle(type: HealthAlertType): string {
    const titles = {
      [HealthAlertType.HEART_RATE_ANOMALY]: 'Unusual Heart Rate Detected',
      [HealthAlertType.OVERTRAINING]: 'Overtraining Risk Detected',
      [HealthAlertType.DEHYDRATION]: 'Dehydration Warning',
    };
    return titles[type] || 'Health Alert';
  }

  private generateAlertDescription(type: HealthAlertType, data: any): string {
    return `Your ${data.metric} reading of ${data.value}${data.unit} is outside the normal range.`;
  }

  private generateRecommendations(type: HealthAlertType, data: any): string[] {
    const recommendations = {
      [HealthAlertType.HEART_RATE_ANOMALY]: [
        'Take a rest and monitor your heart rate',
        'Stay hydrated',
        'Consider consulting a healthcare professional'
      ],
      [HealthAlertType.DEHYDRATION]: [
        'Drink water immediately',
        'Reduce exercise intensity',
        'Monitor urine color'
      ],
    };
    return recommendations[type] || ['Consult with your coach'];
  }

  private requiresMedicalAttention(type: HealthAlertType, data: any): boolean {
    return type === HealthAlertType.HEART_RATE_ANOMALY && data.value > 200;
  }

  private async notifyCoach(userId: number, alert: HealthAlert): Promise<void> {
    // Implementation for notifying coach
    this.emitCoachEvent('client_health_alert', {
      userId,
      alertId: alert.id,
      severity: alert.severity,
      type: alert.type,
    });
  }

  private async generateAIInsights(goal: SmartGoal): Promise<any> {
    const progressPercentage = (goal.currentValue / goal.targetValue) * 100;
    const daysRemaining = Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return {
      probabilityOfSuccess: Math.min(100, progressPercentage + Math.random() * 20),
      suggestedAdjustments: progressPercentage < 50 ? 
        ['Increase workout frequency', 'Focus on consistency'] : 
        ['Maintain current pace', 'Fine-tune nutrition'],
      motivationalMessage: this.generateMotivationalMessage(progressPercentage),
      weeklyProgress: (goal.currentValue - 0) / Math.max(1, Math.ceil((Date.now() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))),
    };
  }

  private generateMotivationalMessage(progress: number): string {
    if (progress < 25) return "Every journey begins with a single step. You're building the foundation!";
    if (progress < 50) return "Great momentum! You're making real progress toward your goal.";
    if (progress < 75) return "You're over halfway there! Keep pushing forward.";
    return "Almost there! Your dedication is about to pay off!";
  }

  private async checkForAchievements(userId: number): Promise<void> {
    // Check for various achievements like workout streaks, personal records, etc.
    this.emitAchievementEvent('achievement_unlocked', {
      userId,
      achievementType: 'workout_completion',
      title: 'Workout Warrior',
      description: 'Completed another amazing workout!',
    });
  }

  private async analyzeHealthMetrics(userId: number, data: any): Promise<void> {
    // Analyze health metrics from workout data
    if (data.heartRateData) {
      const avgHeartRate = data.heartRateData.reduce((sum: number, hr: any) => sum + hr.bpm, 0) / data.heartRateData.length;
      
      if (avgHeartRate > 180) {
        await this.createHealthAlert(userId, HealthAlertType.HEART_RATE_ANOMALY, {
          metric: 'Average Heart Rate',
          value: avgHeartRate,
          normalRange: { min: 60, max: 180 },
          unit: 'bpm',
        });
      }
    }
  }

  private emitWorkoutEvent(event: string, data: any): void {
    // WebSocket implementation would go here
    console.log(`Emitting workout event: ${event}`, data);
  }

  private emitHealthEvent(event: string, data: any): void {
    // WebSocket implementation would go here
    console.log(`Emitting health event: ${event}`, data);
  }

  private emitGoalEvent(event: string, data: any): void {
    // WebSocket implementation would go here
    console.log(`Emitting goal event: ${event}`, data);
  }

  private emitCoachEvent(event: string, data: any): void {
    // WebSocket implementation would go here
    console.log(`Emitting coach event: ${event}`, data);
  }

  private emitAchievementEvent(event: string, data: any): void {
    // WebSocket implementation would go here
    console.log(`Emitting achievement event: ${event}`, data);
  }

  private emitSubscriptionEvent(event: string, data: any): void {
    // WebSocket implementation would go here
    console.log(`Emitting subscription event: ${event}`, data);
  }
}
