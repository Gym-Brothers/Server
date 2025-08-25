import { Gender, ActivityLevel, GoalType, BloodType, EmergencyContactRelation } from './enums';

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  id: number;
  name: string;
  phoneNumber: string;
  email?: string;
  relation: EmergencyContactRelation;
  address?: string;
  isDefault: boolean;
}

export interface HealthMetrics {
  id: number;
  userId: number;
  height: number; // in cm
  weight: number; // in kg
  bodyFatPercentage?: number;
  muscleMass?: number; // in kg
  bmi: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  restingHeartRate?: number;
  maxHeartRate?: number;
  recordedAt: Date;
  notes?: string;
}

export interface MedicalHistory {
  id: number;
  userId: number;
  bloodType?: BloodType;
  allergies: string[];
  medications: string[];
  chronicConditions: string[];
  pastSurgeries: string[];
  injuries: string[];
  physicianName?: string;
  physicianContact?: string;
  lastCheckupDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FitnessGoals {
  id: number;
  userId: number;
  goalType: GoalType;
  targetWeight?: number;
  targetBodyFat?: number;
  targetDate?: Date;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  phoneNumber: string;
  profilePicture?: string;
  
  // Physical Information
  activityLevel: ActivityLevel;
  
  // Health & Fitness
  healthMetrics: HealthMetrics[];
  medicalHistory?: MedicalHistory;
  fitnessGoals: FitnessGoals[];
  
  // Contact Information
  addresses: Address[];
  emergencyContacts: EmergencyContact[];
  
  // System Information
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
