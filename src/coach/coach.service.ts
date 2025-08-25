import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { CoachCertification } from '../entities/coach-certification.entity';
import { CoachSpecialization } from '../entities/coach-specialization.entity';
import { User } from '../entities/user.entity';
import { Subscription } from '../entities/subscription.entity';
import { 
  CreateCoachDto, 
  UpdateCoachProfileDto, 
  CreateCertificationDto,
  CoachSpecializationDto,
  AddSpecializationDto,
  UpdateSpecializationDto,
  CoachReviewDto 
} from '../dto/coach/coach.dto';
import { SubscriptionStatus } from '../models/enums';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
    @InjectRepository(CoachCertification)
    private certificationRepository: Repository<CoachCertification>,
    @InjectRepository(CoachSpecialization)
    private specializationRepository: Repository<CoachSpecialization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async searchCoaches(specialization?: string, minRating?: number): Promise<any> {
    const queryBuilder = this.coachRepository.createQueryBuilder('coach')
      .leftJoinAndSelect('coach.user', 'user')
      .leftJoinAndSelect('coach.specializations', 'specializations')
      .leftJoinAndSelect('coach.certifications', 'certifications')
      .where('coach.isAvailable = :isAvailable', { isAvailable: true });

    if (specialization) {
      queryBuilder.andWhere('specializations.name ILIKE :specialization', {
        specialization: `%${specialization}%`
      });
    }

    if (minRating) {
      queryBuilder.andWhere('coach.averageRating >= :minRating', { minRating });
    }

    const coaches = await queryBuilder
      .orderBy('coach.averageRating', 'DESC')
      .getMany();

    return coaches.map(coach => ({
      id: coach.id,
      firstName: coach.user.firstName,
      lastName: coach.user.lastName,
      bio: coach.bio,
      specializations: coach.specializations.map(s => s.name),
      averageRating: coach.averageRating,
      totalReviews: coach.totalReviews,
      hourlyRate: coach.hourlyRate,
      currency: coach.currency,
      isAvailable: coach.isAvailable,
      yearsOfExperience: coach.yearsOfExperience,
      profilePicture: coach.user.profilePicture,
    }));
  }

  async getCoachProfile(id: number): Promise<any> {
    const coach = await this.coachRepository.findOne({
      where: { id },
      relations: [
        'user',
        'specializations',
        'certifications',
      ],
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    return {
      id: coach.id,
      firstName: coach.user.firstName,
      lastName: coach.user.lastName,
      email: coach.user.email,
      bio: coach.bio,
      yearsOfExperience: coach.yearsOfExperience,
      specializations: coach.specializations,
      certifications: coach.certifications.filter(cert => cert.isVerified),
      averageRating: coach.averageRating,
      totalReviews: coach.totalReviews,
      hourlyRate: coach.hourlyRate,
      currency: coach.currency,
      maxClients: coach.maxClients,
      currentClientCount: coach.currentClientCount,
      isAvailable: coach.isAvailable,
      isVerified: coach.isVerified,
      profilePicture: coach.user.profilePicture,
    };
  }

  async registerAsCoach(userId: number, coachDto: CreateCoachDto): Promise<Coach> {
    // Check if user already has a coach profile
    const existingCoach = await this.coachRepository.findOne({
      where: { userId },
    });

    if (existingCoach) {
      throw new BadRequestException('User already has a coach profile');
    }

    // Create coach without specializations first
    const { specializations, ...coachData } = coachDto;
    
    const coach = this.coachRepository.create({
      userId,
      ...coachData,
    });

    const savedCoach = await this.coachRepository.save(coach);

    // Add specializations separately
    if (specializations && specializations.length > 0) {
      const specializationEntities = specializations.map(name => 
        this.specializationRepository.create({
          coachId: savedCoach.id,
          name,
        })
      );
      await this.specializationRepository.save(specializationEntities);
    }

    return savedCoach;
  }

  async getMyCoachProfile(userId: number): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { userId },
      relations: ['user', 'specializations', 'certifications'],
    });

    if (!coach) {
      throw new NotFoundException('Coach profile not found');
    }

    return coach;
  }

  async updateCoachProfile(userId: number, updateDto: UpdateCoachProfileDto): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { userId },
    });

    if (!coach) {
      throw new NotFoundException('Coach profile not found');
    }

    Object.assign(coach, updateDto);
    return this.coachRepository.save(coach);
  }

  async getMyClients(coachId: number): Promise<any[]> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { 
        coachId,
        status: SubscriptionStatus.ACTIVE
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return subscriptions.map(sub => ({
      id: sub.user.id,
      firstName: sub.user.firstName,
      lastName: sub.user.lastName,
      email: sub.user.email,
      subscriptionType: sub.type,
      subscriptionStatus: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      lastWorkout: null, // TODO: implement workout tracking
      progressScore: Math.floor(Math.random() * 30) + 70, // Mock progress score
    }));
  }

  async getClientProfile(coachId: number, clientId: number): Promise<any> {
    // Verify coach-client relationship
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        coachId,
        userId: clientId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Client not found or not subscribed to this coach');
    }

    const client = await this.userRepository.findOne({
      where: { id: clientId },
      relations: [
        'addresses',
        'emergencyContacts',
        'healthMetrics',
        'medicalHistory',
        'fitnessGoals',
      ],
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const latestMetrics = client.healthMetrics?.[0];
    const activeGoals = client.fitnessGoals?.filter(goal => goal.isActive) || [];

    return {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      age: this.calculateAge(client.dateOfBirth),
      gender: client.gender,
      phoneNumber: client.phoneNumber,
      fitnessGoals: activeGoals.map(goal => goal.goalType),
      currentWeight: latestMetrics?.weight || null,
      goalWeight: activeGoals[0]?.targetWeight || null,
      healthMetrics: {
        height: latestMetrics?.height || null,
        weight: latestMetrics?.weight || null,
        bmi: latestMetrics?.bmi || null,
        bodyFatPercentage: latestMetrics?.bodyFatPercentage || null,
      },
      medicalHistory: {
        allergies: client.medicalHistory?.allergies || [],
        medications: client.medicalHistory?.medications || [],
        injuries: client.medicalHistory?.injuries || [],
        chronicConditions: client.medicalHistory?.chronicConditions || [],
      },
      progressSummary: {
        workoutsCompleted: Math.floor(Math.random() * 50), // TODO: implement workout tracking
        weightChange: this.calculateWeightChange(client.healthMetrics),
        strengthGain: '15%', // TODO: implement strength tracking
      },
      emergencyContact: client.emergencyContacts?.find(contact => contact.isDefault),
    };
  }

  async addCertification(coachId: number, certificationDto: CreateCertificationDto): Promise<CoachCertification> {
    const certification = this.certificationRepository.create({
      coachId,
      ...certificationDto,
      issueDate: new Date(certificationDto.issueDate),
      expiryDate: certificationDto.expiryDate ? new Date(certificationDto.expiryDate) : null,
    });

    return this.certificationRepository.save(certification);
  }

  async getMyReviews(coachId: number): Promise<any> {
    // TODO: Implement review system with separate entity
    // For now, return mock data
    const coach = await this.coachRepository.findOne({
      where: { id: coachId },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    return {
      reviews: [
        {
          id: 1,
          rating: 5,
          comment: 'Excellent coach! Very knowledgeable and motivating.',
          clientName: 'Anonymous Client',
          createdAt: new Date().toISOString(),
        },
      ],
      summary: {
        averageRating: coach.averageRating,
        totalReviews: coach.totalReviews,
        ratingDistribution: {
          5: Math.floor(coach.totalReviews * 0.7),
          4: Math.floor(coach.totalReviews * 0.2),
          3: Math.floor(coach.totalReviews * 0.1),
          2: 0,
          1: 0,
        }
      }
    };
  }

  async addSpecialization(coachId: number, specializationDto: AddSpecializationDto): Promise<CoachSpecialization> {
    const coach = await this.coachRepository.findOne({ where: { id: coachId } });
    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    // Check if specialization already exists for this coach
    const existingSpecialization = await this.specializationRepository.findOne({
      where: { coachId, name: specializationDto.name }
    });

    if (existingSpecialization) {
      throw new BadRequestException('Specialization already exists for this coach');
    }

    const specialization = this.specializationRepository.create({
      coachId,
      ...specializationDto,
    });

    return this.specializationRepository.save(specialization);
  }

  async updateSpecialization(
    coachId: number, 
    specializationId: number, 
    updateDto: UpdateSpecializationDto
  ): Promise<CoachSpecialization> {
    const specialization = await this.specializationRepository.findOne({
      where: { id: specializationId, coachId }
    });

    if (!specialization) {
      throw new NotFoundException('Specialization not found for this coach');
    }

    Object.assign(specialization, updateDto);
    return this.specializationRepository.save(specialization);
  }

  async removeSpecialization(coachId: number, specializationId: number): Promise<{ message: string }> {
    const specialization = await this.specializationRepository.findOne({
      where: { id: specializationId, coachId }
    });

    if (!specialization) {
      throw new NotFoundException('Specialization not found for this coach');
    }

    await this.specializationRepository.remove(specialization);
    return { message: 'Specialization removed successfully' };
  }

  async getCoachSpecializations(coachId: number): Promise<CoachSpecializationDto[]> {
    const specializations = await this.specializationRepository.find({
      where: { coachId }
    });

    return specializations.map(spec => ({
      name: spec.name,
      description: spec.description || undefined
    }));
  }

  // TODO: Implement proper review system when Review entity is created
  async addReview(coachId: number, reviewDto: CoachReviewDto): Promise<{ message: string }> {
    // For now, this is a placeholder that updates coach's average rating
    const coach = await this.coachRepository.findOne({ where: { id: coachId } });
    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    // TODO: Replace with actual review entity creation
    // This is a simplified version that just updates the coach's rating
    const newTotalReviews = coach.totalReviews + 1;
    const newAverageRating = ((coach.averageRating * coach.totalReviews) + reviewDto.rating) / newTotalReviews;

    coach.totalReviews = newTotalReviews;
    coach.averageRating = Math.round(newAverageRating * 100) / 100; // Round to 2 decimal places

    await this.coachRepository.save(coach);

    return { message: 'Review added successfully' };
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private calculateWeightChange(healthMetrics: any[]): number {
    if (!healthMetrics || healthMetrics.length < 2) return 0;
    
    const latest = healthMetrics[0];
    const earliest = healthMetrics[healthMetrics.length - 1];
    
    return latest.weight - earliest.weight;
  }
}
