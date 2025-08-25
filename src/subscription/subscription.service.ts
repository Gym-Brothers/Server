import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { Coach } from '../entities/coach.entity';
import { User } from '../entities/user.entity';
import { CreateSubscriptionDto, UpdateSubscriptionDto, CancelSubscriptionDto } from '../dto/subscription/subscription.dto';
import { SubscriptionStatus, SubscriptionType } from '../models/enums';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getSubscriptionPricing(): Promise<any[]> {
    return [
      {
        type: SubscriptionType.BASIC,
        monthlyPrice: 49.99,
        currency: 'USD',
        features: {
          personalTrainingSessions: 2,
          groupSessions: 8,
          nutritionPlanning: false,
          progressTracking: true,
          customWorkouts: false,
        },
        description: 'Perfect for beginners starting their fitness journey'
      },
      {
        type: SubscriptionType.PREMIUM,
        monthlyPrice: 99.99,
        currency: 'USD',
        features: {
          personalTrainingSessions: 4,
          groupSessions: 12,
          nutritionPlanning: true,
          progressTracking: true,
          customWorkouts: true,
        },
        description: 'Comprehensive fitness package for serious athletes'
      },
      {
        type: SubscriptionType.VIP,
        monthlyPrice: 199.99,
        currency: 'USD',
        features: {
          personalTrainingSessions: 8,
          groupSessions: 20,
          nutritionPlanning: true,
          progressTracking: true,
          customWorkouts: true,
        },
        description: 'Premium experience with maximum personal attention'
      },
      {
        type: SubscriptionType.PERSONAL_TRAINING,
        monthlyPrice: 149.99,
        currency: 'USD',
        features: {
          personalTrainingSessions: 6,
          groupSessions: 0,
          nutritionPlanning: true,
          progressTracking: true,
          customWorkouts: true,
        },
        description: 'One-on-one personal training focused experience'
      }
    ];
  }

  async createSubscription(userId: number, subscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    // Verify coach exists and is available
    const coach = await this.coachRepository.findOne({
      where: { id: subscriptionDto.coachId, isAvailable: true },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found or not available');
    }

    // Check if coach has capacity
    if (coach.currentClientCount >= coach.maxClients) {
      throw new BadRequestException('Coach has reached maximum client capacity');
    }

    // Check if user already has active subscription with this coach
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        userId,
        coachId: subscriptionDto.coachId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('Already have an active subscription with this coach');
    }

    const pricing = this.calculatePricing(subscriptionDto.type);
    const startDate = new Date(subscriptionDto.startDate);
    const endDate = new Date(subscriptionDto.endDate);
    const monthsDiff = this.calculateMonthsDifference(startDate, endDate);

    const subscription = this.subscriptionRepository.create({
      userId,
      coachId: subscriptionDto.coachId,
      type: subscriptionDto.type,
      startDate,
      endDate,
      monthlyPrice: pricing.monthlyPrice,
      totalPrice: pricing.monthlyPrice * monthsDiff,
      personalTrainingSessions: subscriptionDto.personalTrainingSessions,
      groupSessions: subscriptionDto.groupSessions,
      nutritionPlanning: subscriptionDto.nutritionPlanning,
      progressTracking: subscriptionDto.progressTracking,
      customWorkouts: subscriptionDto.customWorkouts,
      paymentMethod: subscriptionDto.paymentMethod,
      nextPaymentDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from start
      status: SubscriptionStatus.PENDING,
    });

    const savedSubscription = await this.subscriptionRepository.save(subscription);

    // Update coach client count
    coach.currentClientCount += 1;
    await this.coachRepository.save(coach);

    return savedSubscription;
  }

  async getMySubscriptions(userId: number): Promise<any[]> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { userId },
      relations: ['coach', 'coach.user'],
      order: { createdAt: 'DESC' },
    });

    return subscriptions.map(sub => ({
      id: sub.id,
      userId: sub.userId,
      coachId: sub.coachId,
      coachName: `${sub.coach.user.firstName} ${sub.coach.user.lastName}`,
      type: sub.type,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      monthlyPrice: sub.monthlyPrice,
      totalPrice: sub.totalPrice,
      currency: sub.currency,
      personalTrainingSessions: sub.personalTrainingSessions,
      groupSessions: sub.groupSessions,
      nutritionPlanning: sub.nutritionPlanning,
      progressTracking: sub.progressTracking,
      customWorkouts: sub.customWorkouts,
      nextPaymentDate: sub.nextPaymentDate,
      sessionsUsed: {
        personal: Math.floor(Math.random() * sub.personalTrainingSessions), // TODO: implement session tracking
        group: Math.floor(Math.random() * sub.groupSessions),
      },
      sessionsRemaining: {
        personal: sub.personalTrainingSessions - Math.floor(Math.random() * sub.personalTrainingSessions),
        group: sub.groupSessions - Math.floor(Math.random() * sub.groupSessions),
      }
    }));
  }

  async getSubscriptionDetails(userId: number, subscriptionId: number): Promise<any> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
      relations: ['coach', 'coach.user', 'coach.specializations'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return {
      id: subscription.id,
      userId: subscription.userId,
      coach: {
        id: subscription.coach.id,
        firstName: subscription.coach.user.firstName,
        lastName: subscription.coach.user.lastName,
        bio: subscription.coach.bio,
        specializations: subscription.coach.specializations.map(s => s.name),
        averageRating: subscription.coach.averageRating,
      },
      type: subscription.type,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      monthlyPrice: subscription.monthlyPrice,
      totalPrice: subscription.totalPrice,
      currency: subscription.currency,
      features: {
        personalTrainingSessions: subscription.personalTrainingSessions,
        groupSessions: subscription.groupSessions,
        nutritionPlanning: subscription.nutritionPlanning,
        progressTracking: subscription.progressTracking,
        customWorkouts: subscription.customWorkouts,
      },
      paymentHistory: [], // TODO: implement payment history
      nextPaymentDate: subscription.nextPaymentDate,
    };
  }

  async updateSubscription(userId: number, subscriptionId: number, updateDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled subscription');
    }

    Object.assign(subscription, updateDto);

    if (updateDto.endDate) {
      subscription.endDate = new Date(updateDto.endDate);
    }

    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(userId: number, subscriptionId: number, cancelDto: CancelSubscriptionDto): Promise<any> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
      relations: ['coach'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Subscription already cancelled');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = cancelDto.cancellationReason;

    await this.subscriptionRepository.save(subscription);

    // Update coach client count
    if (subscription.coach) {
      subscription.coach.currentClientCount = Math.max(0, subscription.coach.currentClientCount - 1);
      await this.coachRepository.save(subscription.coach);
    }

    return {
      id: subscription.id,
      userId: subscription.userId,
      status: subscription.status,
      cancellationReason: subscription.cancellationReason,
      effectiveDate: subscription.cancelledAt,
      cancelledAt: subscription.cancelledAt,
      refundAmount: 0, // TODO: implement refund calculation
    };
  }

  async renewSubscription(userId: number, subscriptionId: number): Promise<any> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const newEndDate = new Date(subscription.endDate.getTime() + 365 * 24 * 60 * 60 * 1000); // Add 1 year
    subscription.endDate = newEndDate;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.subscriptionRepository.save(subscription);

    return {
      id: subscription.id,
      userId: subscription.userId,
      status: subscription.status,
      newEndDate: subscription.endDate,
      renewedAt: new Date(),
      nextPaymentDate: subscription.nextPaymentDate,
    };
  }

  async getSubscriptionAnalytics(userId: number): Promise<any> {
    const activeSubscriptions = await this.subscriptionRepository.find({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });

    if (activeSubscriptions.length === 0) {
      return {
        message: 'No active subscriptions found',
        data: null,
      };
    }

    const subscription = activeSubscriptions[0]; // Get the first active subscription

    return {
      userId,
      currentPeriod: {
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        sessionsAttended: {
          personal: Math.floor(Math.random() * subscription.personalTrainingSessions),
          group: Math.floor(Math.random() * subscription.groupSessions),
        },
        sessionsTotal: {
          personal: subscription.personalTrainingSessions,
          group: subscription.groupSessions,
        },
        utilizationRate: Math.floor(Math.random() * 30) + 70, // Mock utilization rate
      },
      monthlyTrends: [
        { month: '2025-06', utilization: 92 },
        { month: '2025-07', utilization: 88 },
        { month: '2025-08', utilization: 85 },
      ],
      recommendations: [
        'You have sessions remaining this month',
        'Consider booking additional sessions to maximize your subscription value',
      ]
    };
  }

  private calculatePricing(type: SubscriptionType): { monthlyPrice: number } {
    const pricingMap = {
      [SubscriptionType.BASIC]: { monthlyPrice: 49.99 },
      [SubscriptionType.PREMIUM]: { monthlyPrice: 99.99 },
      [SubscriptionType.VIP]: { monthlyPrice: 199.99 },
      [SubscriptionType.PERSONAL_TRAINING]: { monthlyPrice: 149.99 },
    };

    return pricingMap[type] || { monthlyPrice: 0 };
  }

  private calculateMonthsDifference(startDate: Date, endDate: Date): number {
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    return Math.max(1, months);
  }
}
