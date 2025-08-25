import { Injectable } from '@nestjs/common';
import { Observable, Subject, BehaviorSubject, interval, timer } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged, switchMap, catchError, retry, tap, takeUntil } from 'rxjs/operators';
import { of, throwError, EMPTY } from 'rxjs';

@Injectable()
export class RealtimeService {
  // Real-time workout tracking
  private workoutUpdates$ = new Subject<any>();
  private coachClientCommunication$ = new Subject<any>();
  private subscriptionChanges$ = new BehaviorSubject<any>(null);
  private healthMetricsUpdates$ = new Subject<any>();

  // 1. Real-time Workout Tracking
  emitWorkoutUpdate(userId: number, workoutData: any) {
    this.workoutUpdates$.next({
      userId,
      timestamp: new Date(),
      ...workoutData
    });
  }

  getWorkoutUpdates(userId: number): Observable<any> {
    return this.workoutUpdates$.pipe(
      filter(update => update.userId === userId),
      map(update => ({
        exercise: update.exercise,
        sets: update.sets,
        reps: update.reps,
        weight: update.weight,
        timestamp: update.timestamp
      }))
    );
  }

  // 2. Coach-Client Real-time Communication
  sendMessageToClient(coachId: number, clientId: number, message: string) {
    this.coachClientCommunication$.next({
      from: coachId,
      to: clientId,
      message,
      timestamp: new Date(),
      type: 'coach_to_client'
    });
  }

  getClientMessages(clientId: number): Observable<any> {
    return this.coachClientCommunication$.pipe(
      filter(msg => msg.to === clientId),
      debounceTime(100), // Prevent spam
      distinctUntilChanged((prev, curr) => prev.message === curr.message)
    );
  }

  // 3. Subscription Status Monitoring
  updateSubscriptionStatus(userId: number, status: string, details: any) {
    this.subscriptionChanges$.next({
      userId,
      status,
      details,
      timestamp: new Date()
    });
  }

  getSubscriptionUpdates(userId: number): Observable<any> {
    return this.subscriptionChanges$.pipe(
      filter(change => change && change.userId === userId),
      distinctUntilChanged((prev, curr) => prev?.status === curr?.status)
    );
  }

  // 4. Real-time Health Metrics Monitoring
  monitorHealthMetrics(userId: number): Observable<any> {
    return timer(0, 30000) // Check every 30 seconds
      .pipe(
        switchMap(() => this.getLatestHealthMetrics(userId)),
        distinctUntilChanged((prev, curr) => 
          prev?.weight === curr?.weight && 
          prev?.heartRate === curr?.heartRate &&
          prev?.bmi === curr?.bmi
        ),
        map(metrics => this.analyzeHealthMetrics(metrics)),
        tap(analysis => {
          if (analysis.alerts.length > 0) {
            this.sendHealthAlerts(userId, analysis.alerts);
          }
        }),
        catchError(error => {
          console.error('Health monitoring error:', error);
          return EMPTY;
        })
      );
  }

  // Emit health metrics update
  emitHealthMetricsUpdate(userId: number, metrics: any) {
    this.healthMetricsUpdates$.next({
      userId,
      metrics,
      timestamp: new Date()
    });
  }

  // Get health metrics updates stream
  getHealthMetricsUpdates(userId: number): Observable<any> {
    return this.healthMetricsUpdates$.pipe(
      filter(update => update.userId === userId),
      map(update => update.metrics)
    );
  }

  // 5. Health Metrics Stream Processing
  processHealthMetrics(healthData: any[]): Observable<any> {
    return of(healthData).pipe(
      map(data => this.calculateHealthTrends(data)),
      map(trends => this.generateHealthInsights(trends)),
      catchError(error => {
        console.error('Health metrics processing error:', error);
        return of({ error: 'Failed to process health metrics' });
      })
    );
  }

  private calculateHealthTrends(data: any[]): any {
    // Calculate BMI trends, weight changes, etc.
    return {
      weightTrend: this.calculateTrend(data.map(d => d.weight)),
      bmiTrend: this.calculateTrend(data.map(d => d.bmi)),
      progressScore: this.calculateProgressScore(data)
    };
  }

  private generateHealthInsights(trends: any): any {
    return {
      insights: [
        trends.weightTrend > 0 ? 'Weight increasing' : 'Weight decreasing',
        trends.progressScore > 80 ? 'Excellent progress!' : 'Keep working!',
      ],
      recommendations: this.getRecommendations(trends),
      trends
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const latest = values[values.length - 1];
    const previous = values[values.length - 2];
    return ((latest - previous) / previous) * 100;
  }

  private calculateProgressScore(data: any[]): number {
    // Mock calculation - implement actual logic
    return Math.floor(Math.random() * 100);
  }

  private getRecommendations(trends: any): string[] {
    const recommendations = [];
    if (trends.weightTrend > 5) {
      recommendations.push('Consider adjusting your diet plan');
    }
    if (trends.progressScore < 50) {
      recommendations.push('Increase workout frequency');
    }
    return recommendations;
  }

  private getLatestHealthMetrics(userId: number): Observable<any> {
    // Mock health metrics - in real implementation, this would fetch from database
    return of({
      userId,
      weight: 70 + Math.random() * 10, // Random weight between 70-80kg
      height: 175, // Fixed height
      bmi: null, // Will be calculated
      heartRate: 60 + Math.random() * 40, // Random heart rate 60-100
      bloodPressureSystolic: 110 + Math.random() * 20, // 110-130
      bloodPressureDiastolic: 70 + Math.random() * 15, // 70-85
      bodyFatPercentage: 12 + Math.random() * 8, // 12-20%
      recordedAt: new Date()
    }).pipe(
      map(metrics => ({
        ...metrics,
        bmi: Math.round((metrics.weight / Math.pow(metrics.height / 100, 2)) * 100) / 100
      }))
    );
  }

  private analyzeHealthMetrics(metrics: any): any {
    const alerts = [];
    
    if (metrics?.heartRate > 180) {
      alerts.push('High heart rate detected - consider rest');
    }
    if (metrics?.heartRate < 50) {
      alerts.push('Low heart rate detected - consult doctor if persistent');
    }
    if (metrics?.bmi > 30) {
      alerts.push('BMI indicates obesity - consider diet adjustment');
    }
    if (metrics?.bmi < 18.5) {
      alerts.push('BMI indicates underweight - consider nutrition consultation');
    }
    if (metrics?.bloodPressureSystolic > 140) {
      alerts.push('High blood pressure detected - monitor closely');
    }
    
    return { 
      metrics, 
      alerts, 
      timestamp: new Date(),
      healthScore: this.calculateHealthScore(metrics)
    };
  }

  private sendHealthAlerts(userId: number, alerts: string[]): void {
    console.log(`🚨 Health alerts for user ${userId}:`, alerts);
    // Emit real-time alert
    this.emitHealthMetricsUpdate(userId, {
      type: 'health_alert',
      alerts,
      timestamp: new Date()
    });
    // TODO: Implement actual alert system (email, push notifications, etc.)
  }

  private calculateHealthScore(metrics: any): number {
    if (!metrics) return 0;
    
    let score = 100;
    
    // Deduct points for concerning metrics
    if (metrics.bmi > 25) score -= 10;
    if (metrics.bmi > 30) score -= 20;
    if (metrics.heartRate > 100) score -= 15;
    if (metrics.heartRate < 60) score -= 10;
    if (metrics.bloodPressureSystolic > 140) score -= 25;
    if (metrics.bodyFatPercentage > 25) score -= 10;
    
    return Math.max(0, score);
  }
}
