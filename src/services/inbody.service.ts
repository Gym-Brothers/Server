import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InBodyTest } from '../entities/inbody-test.entity';
import { User } from '../entities/user.entity';

export interface InBodyAnalysis {
  bmi: number;
  bodyFatCategory: string;
  muscleMassCategory: string;
  metabolicAge: number;
  hydrationStatus: string;
  recommendations: string[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

@Injectable()
export class InBodyService {
  constructor(
    @InjectRepository(InBodyTest)
    private inBodyRepository: Repository<InBodyTest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createInBodyTest(userId: number, testData: Partial<InBodyTest>): Promise<InBodyTest> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const inBodyTest = this.inBodyRepository.create({
      ...testData,
      userId,
    });

    return this.inBodyRepository.save(inBodyTest);
  }

  async getUserInBodyTests(userId: number): Promise<InBodyTest[]> {
    return this.inBodyRepository.find({
      where: { userId },
      order: { testDate: 'DESC' },
    });
  }

  async getLatestInBodyTest(userId: number): Promise<InBodyTest | null> {
    return this.inBodyRepository.findOne({
      where: { userId },
      order: { testDate: 'DESC' },
    });
  }

  async analyzeInBodyData(inBodyTest: InBodyTest, user: User): Promise<InBodyAnalysis> {
    const age = this.calculateAge(user.dateOfBirth);
    const bmi = this.calculateBMI(inBodyTest.weight, inBodyTest.height);
    
    return {
      bmi,
      bodyFatCategory: this.categorizeBodyFat(inBodyTest.bodyFatPercentage, user.gender, age),
      muscleMassCategory: this.categorizeMuscleMass(inBodyTest.skeletalMuscleMass, inBodyTest.weight),
      metabolicAge: this.calculateMetabolicAge(inBodyTest.basalMetabolicRate, age, user.gender),
      hydrationStatus: this.analyzeHydration(inBodyTest.totalBodyWater, inBodyTest.weight),
      recommendations: this.generateRecommendations(inBodyTest, user),
      ...this.calculateNutritionTargets(inBodyTest, user),
    };
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private calculateBMI(weight: number, height: number): number {
    return Number((weight / Math.pow(height / 100, 2)).toFixed(1));
  }

  private categorizeBodyFat(bodyFatPercentage: number, gender: string, age: number): string {
    const ranges = gender === 'male' 
      ? { essential: 5, athlete: 13, fitness: 17, average: 25, obese: 32 }
      : { essential: 12, athlete: 20, fitness: 24, average: 31, obese: 36 };

    if (bodyFatPercentage <= ranges.essential) return 'Essential Fat';
    if (bodyFatPercentage <= ranges.athlete) return 'Athlete';
    if (bodyFatPercentage <= ranges.fitness) return 'Fitness';
    if (bodyFatPercentage <= ranges.average) return 'Average';
    return 'Obese';
  }

  private categorizeMuscleMass(muscleMass: number, totalWeight: number): string {
    const musclePercentage = (muscleMass / totalWeight) * 100;
    
    if (musclePercentage >= 45) return 'Excellent';
    if (musclePercentage >= 40) return 'Good';
    if (musclePercentage >= 35) return 'Average';
    return 'Below Average';
  }

  private calculateMetabolicAge(bmr: number, actualAge: number, gender: string): number {
    // Simplified metabolic age calculation based on BMR
    const expectedBMR = gender === 'male' 
      ? 88.362 + (13.397 * 70) + (4.799 * 175) - (5.677 * actualAge)
      : 447.593 + (9.247 * 60) + (3.098 * 165) - (4.330 * actualAge);
    
    const metabolicAgeDiff = (expectedBMR - bmr) / 10;
    return Math.round(actualAge + metabolicAgeDiff);
  }

  private analyzeHydration(totalBodyWater: number, weight: number): string {
    const hydrationPercentage = (totalBodyWater / weight) * 100;
    
    if (hydrationPercentage >= 60) return 'Well Hydrated';
    if (hydrationPercentage >= 55) return 'Adequately Hydrated';
    if (hydrationPercentage >= 50) return 'Mildly Dehydrated';
    return 'Dehydrated';
  }

  private generateRecommendations(inBodyTest: InBodyTest, user: User): string[] {
    const recommendations: string[] = [];
    const age = this.calculateAge(user.dateOfBirth);
    
    // Body fat recommendations
    if (inBodyTest.bodyFatPercentage > 25) {
      recommendations.push('Focus on cardio exercises and caloric deficit for fat loss');
    } else if (inBodyTest.bodyFatPercentage < 10) {
      recommendations.push('Consider increasing healthy fats in your diet');
    }

    // Muscle mass recommendations
    const musclePercentage = (inBodyTest.skeletalMuscleMass / inBodyTest.weight) * 100;
    if (musclePercentage < 35) {
      recommendations.push('Incorporate strength training to build muscle mass');
      recommendations.push('Increase protein intake to support muscle growth');
    }

    // Hydration recommendations
    const hydrationPercentage = (inBodyTest.totalBodyWater / inBodyTest.weight) * 100;
    if (hydrationPercentage < 55) {
      recommendations.push('Increase daily water intake');
    }

    // Visceral fat recommendations
    if (inBodyTest.visceralFatLevel > 12) {
      recommendations.push('Reduce visceral fat through regular exercise and proper nutrition');
    }

    return recommendations;
  }

  private calculateNutritionTargets(inBodyTest: InBodyTest, user: User) {
    const activityMultiplier = this.getActivityMultiplier(user.activityLevel);
    const targetCalories = Math.round(inBodyTest.basalMetabolicRate * activityMultiplier);
    
    // Protein: 1.6-2.2g per kg of body weight for active individuals
    const targetProtein = Math.round(inBodyTest.weight * 1.8);
    
    // Fat: 25-30% of total calories
    const targetFat = Math.round((targetCalories * 0.275) / 9);
    
    // Carbs: remaining calories
    const targetCarbs = Math.round((targetCalories - (targetProtein * 4) - (targetFat * 9)) / 4);
    
    return { targetCalories, targetProtein, targetCarbs, targetFat };
  }

  private getActivityMultiplier(activityLevel: string): number {
    switch (activityLevel) {
      case 'sedentary': return 1.2;
      case 'lightly_active': return 1.375;
      case 'moderately_active': return 1.55;
      case 'very_active': return 1.725;
      case 'extra_active': return 1.9;
      default: return 1.375;
    }
  }
}
