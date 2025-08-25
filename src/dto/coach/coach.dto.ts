import { SubscriptionType } from '../../models/enums';
import { IsString, IsNumber, IsOptional, Min, Max, IsArray } from 'class-validator';

export class CreateCoachDto {
  @IsString()
  bio: string;

  @IsNumber()
  @Min(0)
  yearsOfExperience: number;

  @IsArray()
  @IsString({ each: true })
  specializations: string[];

  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @IsNumber()
  @Min(1)
  maxClients: number;
}

export class UpdateCoachProfileDto {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  yearsOfExperience?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hourlyRate?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxClients?: number;

  @IsOptional()
  isAvailable?: boolean;
}

export class CreateCertificationDto {
  @IsString()
  name: string;

  @IsString()
  issuingOrganization: string;

  @IsString()
  issueDate: string; // ISO date string

  @IsString()
  @IsOptional()
  expiryDate?: string; // ISO date string

  @IsString()
  @IsOptional()
  certificateNumber?: string;
}

export class CoachSpecializationDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CoachReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number; // 1-5 scale

  @IsString()
  @IsOptional()
  comment?: string;

  @IsNumber()
  clientId: number;
}

export class AddSpecializationDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSpecializationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
