import { Injectable } from '@nestjs/common';
import { Observable, forkJoin, combineLatest, timer, EMPTY, throwError } from 'rxjs';
import {
    map,
    switchMap,
    catchError,
    retry,
    timeout,
    debounceTime,
    distinctUntilChanged,
    share,
    tap
} from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Coach } from '../entities/coach.entity';
import { Subscription } from '../entities/subscription.entity';
import { HealthMetrics } from '../entities/health-metrics.entity';
import { SubscriptionStatus } from '../models/enums';

@Injectable()
export class AsyncOperationsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(HealthMetrics)
    private healthMetricsRepository: Repository<HealthMetrics>,
  ) {}

  // 1. Complex User Dashboard Data Loading with RxJS
  getUserDashboardData(userId: number): Observable<any> {
    // Combine multiple async operations in parallel
    const user$ = this.getUserData(userId);
    const subscriptions$ = this.getUserSubscriptions(userId);
    const healthMetrics$ = this.getLatestHealthMetrics(userId);
    const coachInfo$ = this.getActiveCoachInfo(userId);

    return forkJoin({
      user: user$,
      subscriptions: subscriptions$,
      healthMetrics: healthMetrics$,
      coachInfo: coachInfo$
    }).pipe(
      map(data => this.combineDashboardData(data)),
      catchError(error => {
        console.error('Dashboard data loading error:', error);
        return this.getFallbackDashboardData(userId);
      }),
      retry(2), // Retry failed requests twice
      timeout(10000), // 10 second timeout
      share() // Share the result among multiple subscribers
    );
  }

  // 2. Smart Coach Search with Debouncing and Caching
  searchCoachesWithFilters(searchTerm$: Observable<string>, filters$: Observable<any>): Observable<any[]> {
    return combineLatest([
      searchTerm$.pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only search if term actually changed
        map(term => term.trim())
      ),
      filters$
    ]).pipe(
      switchMap(([searchTerm, filters]) => {
        if (searchTerm.length < 2) {
          return EMPTY; // Don't search for terms less than 2 characters
        }
        return this.performCoachSearch(searchTerm, filters);
      }),
      catchError(error => {
        console.error('Coach search error:', error);
        return []; // Return empty array on error
      }),
      share() // Cache results for multiple components
    );
  }

  // 3. Subscription Payment Processing with Retry Logic
  processSubscriptionPayment(subscriptionData: any): Observable<any> {
    return this.validatePaymentData(subscriptionData).pipe(
      switchMap(validData => this.chargePayment(validData)),
      switchMap(paymentResult => this.createSubscription(paymentResult)),
      switchMap(subscription => this.sendConfirmationEmail(subscription)),
      catchError(error => this.handlePaymentError(error)),
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.log(`Payment retry attempt ${retryCount} for error:`, error.message);
          return timer(retryCount * 1000); // Exponential backoff: 1s, 2s, 3s
        }
      })
    );
  }

  // 4. Real-time Health Metrics Monitoring
  monitorHealthMetrics(userId: number): Observable<any> {
    return timer(0, 30000) // Check every 30 seconds
      .pipe(
        switchMap(() => this.getLatestHealthMetrics(userId)),
        distinctUntilChanged((prev, curr) => 
          prev?.weight === curr?.weight && prev?.heartRate === curr?.heartRate
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

  // 5. Batch Operations for Admin Dashboard
  getAdminDashboardStats(): Observable<any> {
    const totalUsers$ = this.getTotalUsers();
    const activeSubscriptions$ = this.getActiveSubscriptions();
    const monthlyRevenue$ = this.getMonthlyRevenue();
    const coachPerformance$ = this.getCoachPerformanceMetrics();

    return forkJoin({
      totalUsers: totalUsers$,
      activeSubscriptions: activeSubscriptions$,
      monthlyRevenue: monthlyRevenue$,
      coachPerformance: coachPerformance$
    }).pipe(
      map(stats => ({
        ...stats,
        generatedAt: new Date(),
        trends: this.calculateTrends(stats)
      })),
      timeout(15000),
      catchError(error => {
        console.error('Admin dashboard error:', error);
        return this.getBasicStats();
      })
    );
  }

  // Helper methods
  private getUserData(userId: number): Observable<any> {
    return new Observable(observer => {
      this.userRepository.findOne({ where: { id: userId } })
        .then(user => {
          observer.next(user);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  private getUserSubscriptions(userId: number): Observable<any[]> {
    return new Observable(observer => {
      this.subscriptionRepository.find({ 
        where: { userId },
        relations: ['coach', 'coach.user']
      })
        .then(subscriptions => {
          observer.next(subscriptions);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  private getLatestHealthMetrics(userId: number): Observable<any> {
    return new Observable(observer => {
      this.healthMetricsRepository.findOne({
        where: { userId },
        order: { recordedAt: 'DESC' }
      })
        .then(metrics => {
          observer.next(metrics);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  private getActiveCoachInfo(userId: number): Observable<any> {
    return new Observable(observer => {
      this.subscriptionRepository.findOne({
        where: { userId, status: SubscriptionStatus.ACTIVE },
        relations: ['coach', 'coach.user', 'coach.specializations']
      })
        .then(subscription => {
          observer.next(subscription?.coach || null);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  private combineDashboardData(data: any): any {
    return {
      user: {
        name: `${data.user.firstName} ${data.user.lastName}`,
        memberSince: data.user.createdAt,
      },
      activeSubscriptions: data.subscriptions?.length || 0,
      currentCoach: data.coachInfo ? {
        name: `${data.coachInfo.user.firstName} ${data.coachInfo.user.lastName}`,
        specializations: data.coachInfo.specializations?.map(s => s.name) || []
      } : null,
      latestMetrics: data.healthMetrics ? {
        weight: data.healthMetrics.weight,
        bmi: data.healthMetrics.bmi,
        recordedAt: data.healthMetrics.recordedAt
      } : null,
      summary: {
        healthScore: this.calculateHealthScore(data.healthMetrics),
        progress: this.calculateProgress(data.subscriptions, data.healthMetrics)
      }
    };
  }

  private getFallbackDashboardData(userId: number): Observable<any> {
    return new Observable(observer => {
      observer.next({
        user: { name: 'User', memberSince: new Date() },
        activeSubscriptions: 0,
        currentCoach: null,
        latestMetrics: null,
        summary: { healthScore: 0, progress: 0 },
        error: 'Some data could not be loaded'
      });
      observer.complete();
    });
  }

  private performCoachSearch(searchTerm: string, filters: any): Observable<any[]> {
    return new Observable(observer => {
      const query = this.coachRepository.createQueryBuilder('coach')
        .leftJoinAndSelect('coach.user', 'user')
        .leftJoinAndSelect('coach.specializations', 'specializations')
        .where('coach.isAvailable = :available', { available: true });

      if (searchTerm) {
        query.andWhere(
          '(user.firstName ILIKE :term OR user.lastName ILIKE :term OR coach.bio ILIKE :term)',
          { term: `%${searchTerm}%` }
        );
      }

      if (filters.specialization) {
        query.andWhere('specializations.name = :specialization', { 
          specialization: filters.specialization 
        });
      }

      if (filters.minRating) {
        query.andWhere('coach.averageRating >= :rating', { rating: filters.minRating });
      }

      query.getMany()
        .then(coaches => {
          observer.next(coaches);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  private validatePaymentData(data: any): Observable<any> {
    return new Observable(observer => {
      // Simulate payment validation
      setTimeout(() => {
        if (data.amount && data.paymentMethod) {
          observer.next(data);
          observer.complete();
        } else {
          observer.error(new Error('Invalid payment data'));
        }
      }, 100);
    });
  }

  private chargePayment(data: any): Observable<any> {
    return new Observable(observer => {
      // Simulate payment processing
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          observer.next({ ...data, transactionId: `txn_${Date.now()}` });
          observer.complete();
        } else {
          observer.error(new Error('Payment failed'));
        }
      }, 2000);
    });
  }

  private createSubscription(paymentResult: any): Observable<any> {
    return new Observable(observer => {
      // Create subscription in database
      const subscription = this.subscriptionRepository.create({
        ...paymentResult,
        status: SubscriptionStatus.ACTIVE,
        createdAt: new Date()
      });
      
      this.subscriptionRepository.save(subscription)
        .then(saved => {
          observer.next(saved);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  private sendConfirmationEmail(subscription: any): Observable<any> {
    return new Observable(observer => {
      // Simulate email sending
      setTimeout(() => {
        console.log(`Confirmation email sent for subscription ${subscription.id}`);
        observer.next({ ...subscription, emailSent: true });
        observer.complete();
      }, 500);
    });
  }

  private handlePaymentError(error: any): Observable<never> {
    console.error('Payment processing failed:', error);
    // Log error, send alert to admin, etc.
    return throwError(() => new Error(`Payment failed: ${error.message}`));
  }

  private analyzeHealthMetrics(metrics: any): any {
    const alerts = [];
    if (metrics?.heartRate > 180) {
      alerts.push('High heart rate detected');
    }
    if (metrics?.bmi > 30) {
      alerts.push('BMI indicates obesity');
    }
    
    return { metrics, alerts, timestamp: new Date() };
  }

  private sendHealthAlerts(userId: number, alerts: string[]): void {
    console.log(`Health alerts for user ${userId}:`, alerts);
    // Implement actual alert system (email, push notifications, etc.)
  }

  private calculateHealthScore(metrics: any): number {
    if (!metrics) return 0;
    // Implement health score calculation
    return Math.floor(Math.random() * 100);
  }

  private calculateProgress(subscriptions: any[], metrics: any): number {
    // Implement progress calculation based on subscriptions and metrics
    return Math.floor(Math.random() * 100);
  }

  private getTotalUsers(): Observable<number> {
    return new Observable(observer => {
      this.userRepository.count()
        .then(count => {
          observer.next(count);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  private getActiveSubscriptions(): Observable<number> {
    return new Observable(observer => {
      this.subscriptionRepository.count({ where: { status: SubscriptionStatus.ACTIVE } })
        .then(count => {
          observer.next(count);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  private getMonthlyRevenue(): Observable<number> {
    return new Observable(observer => {
      // Simulate revenue calculation
      observer.next(Math.floor(Math.random() * 50000));
      observer.complete();
    });
  }

  private getCoachPerformanceMetrics(): Observable<any[]> {
    return new Observable(observer => {
      this.coachRepository.find({
        select: ['id', 'averageRating', 'totalReviews', 'currentClientCount'],
        relations: ['user']
      })
        .then(coaches => {
          observer.next(coaches);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  private calculateTrends(stats: any): any {
    return {
      userGrowth: '+12%',
      revenueGrowth: '+8%',
      subscriptionGrowth: '+15%'
    };
  }

  private getBasicStats(): Observable<any> {
    return new Observable(observer => {
      observer.next({
        totalUsers: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        coachPerformance: [],
        error: 'Could not load complete statistics'
      });
      observer.complete();
    });
  }
}
