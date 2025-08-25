import { SubscriptionStatus, SubscriptionType } from './enums';
import { User } from './user.model';

export interface CoachSpecialization {
  id: number;
  name: string;
  description?: string;
}

export interface CoachCertification {
  id: number;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateNumber?: string;
  isVerified: boolean;
}

export interface Coach {
  id: number;
  userId: number; // Reference to User table
  user: User; // User profile information
  
  // Professional Information
  bio: string;
  yearsOfExperience: number;
  specializations: CoachSpecialization[];
  certifications: CoachCertification[];
  
  // Rating & Reviews
  averageRating: number;
  totalReviews: number;
  
  // Pricing
  hourlyRate: number;
  currency: string;
  
  // Availability
  isAvailable: boolean;
  maxClients: number;
  currentClientCount: number;
  
  // System Information
  isVerified: boolean;
  verificationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: number;
  userId: number;
  coachId: number;
  user: User;
  coach: Coach;
  
  // Subscription Details
  type: SubscriptionType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  
  // Pricing
  monthlyPrice: number;
  totalPrice: number;
  currency: string;
  
  // Features
  personalTrainingSessions: number;
  groupSessions: number;
  nutritionPlanning: boolean;
  progressTracking: boolean;
  customWorkouts: boolean;
  
  // Payment Information
  paymentMethod?: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  
  // System Information
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface CoachClientRelationship {
  id: number;
  coachId: number;
  clientId: number;
  subscriptionId: number;
  coach: Coach;
  client: User;
  subscription: Subscription;
  
  // Relationship Details
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  
  // Communication
  lastContactDate?: Date;
  communicationPreference: string; // email, phone, app
  
  // Progress Tracking
  initialAssessmentDate?: Date;
  lastAssessmentDate?: Date;
  nextAssessmentDate?: Date;
  
  // Notes
  coachNotes?: string;
  clientNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
