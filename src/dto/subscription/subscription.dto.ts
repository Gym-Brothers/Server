import { SubscriptionType } from '../../models/enums';

export class CreateSubscriptionDto {
  coachId: number;
  type: SubscriptionType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  personalTrainingSessions: number;
  groupSessions: number;
  nutritionPlanning: boolean;
  progressTracking: boolean;
  customWorkouts: boolean;
  paymentMethod: string;
}

export class UpdateSubscriptionDto {
  type?: SubscriptionType;
  endDate?: string; // ISO date string
  personalTrainingSessions?: number;
  groupSessions?: number;
  nutritionPlanning?: boolean;
  progressTracking?: boolean;
  customWorkouts?: boolean;
  paymentMethod?: string;
}

export class CancelSubscriptionDto {
  cancellationReason: string;
  effectiveDate?: string; // ISO date string
}

export class SubscriptionPricingDto {
  type: SubscriptionType;
  monthlyPrice: number;
  features: {
    personalTrainingSessions: number;
    groupSessions: number;
    nutritionPlanning: boolean;
    progressTracking: boolean;
    customWorkouts: boolean;
  };
}

export class RenewSubscriptionDto {
  newEndDate: string; // ISO date string
  paymentMethod?: string;
}
