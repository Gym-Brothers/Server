import { BloodType } from '../../models/enums';

export class CreateHealthMetricsDto {
  height: number; // in cm
  weight: number; // in kg
  bodyFatPercentage?: number;
  muscleMass?: number; // in kg
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  restingHeartRate?: number;
  maxHeartRate?: number;
  notes?: string;
}

export class UpdateHealthMetricsDto {
  height?: number;
  weight?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  restingHeartRate?: number;
  maxHeartRate?: number;
  notes?: string;
}

export class CreateMedicalHistoryDto {
  bloodType?: BloodType;
  allergies: string[];
  medications: string[];
  chronicConditions: string[];
  pastSurgeries: string[];
  injuries: string[];
  physicianName?: string;
  physicianContact?: string;
  lastCheckupDate?: string; // ISO date string
  notes?: string;
}

export class UpdateMedicalHistoryDto {
  bloodType?: BloodType;
  allergies?: string[];
  medications?: string[];
  chronicConditions?: string[];
  pastSurgeries?: string[];
  injuries?: string[];
  physicianName?: string;
  physicianContact?: string;
  lastCheckupDate?: string; // ISO date string
  notes?: string;
}

export class HealthAssessmentDto {
  // Physical measurements
  height: number;
  weight: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  
  // Vital signs
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  restingHeartRate?: number;
  
  // Medical information
  bloodType?: BloodType;
  allergies?: string[];
  medications?: string[];
  chronicConditions?: string[];
  
  // Fitness assessment
  fitnessLevel: number; // 1-10 scale
  flexibilityScore?: number;
  strengthScore?: number;
  enduranceScore?: number;
  
  // Goals and preferences
  primaryGoals: string[];
  exercisePreferences: string[];
  availableWorkoutDays: string[];
  preferredWorkoutTime: string;
  
  // Limitations
  injuries?: string[];
  physicalLimitations?: string[];
  
  notes?: string;
}
