import { Gender, ActivityLevel, GoalType, BloodType, EmergencyContactRelation } from '../../models/enums';

export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  gender: Gender;
  phoneNumber: string;
  activityLevel: ActivityLevel;
}

export class UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  activityLevel?: ActivityLevel;
  profilePicture?: string;
}

export class CreateAddressDto {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export class UpdateAddressDto {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

export class CreateEmergencyContactDto {
  name: string;
  phoneNumber: string;
  email?: string;
  relation: EmergencyContactRelation;
  address?: string;
  isDefault?: boolean;
}

export class UpdateEmergencyContactDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  relation?: EmergencyContactRelation;
  address?: string;
  isDefault?: boolean;
}

export class CreateFitnessGoalDto {
  goalType: GoalType;
  targetWeight?: number;
  targetBodyFat?: number;
  targetDate?: string; // ISO date string
  description: string;
}
