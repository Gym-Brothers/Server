import { SubscriptionType } from '../../models/enums';

export class CreateCoachDto {
  bio: string;
  yearsOfExperience: number;
  specializations: string[];
  hourlyRate: number;
  currency: string;
  maxClients: number;
}

export class UpdateCoachProfileDto {
  bio?: string;
  yearsOfExperience?: number;
  hourlyRate?: number;
  maxClients?: number;
  isAvailable?: boolean;
}

export class CreateCertificationDto {
  name: string;
  issuingOrganization: string;
  issueDate: string; // ISO date string
  expiryDate?: string; // ISO date string
  certificateNumber?: string;
}

export class CoachSpecializationDto {
  name: string;
  description?: string;
}

export class CoachReviewDto {
  rating: number; // 1-5 scale
  comment?: string;
  clientId: number;
}
