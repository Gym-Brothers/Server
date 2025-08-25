import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { CoachCertification } from '../entities/coach-certification.entity';
import { CoachSpecialization } from '../entities/coach-specialization.entity';
import { User } from '../entities/user.entity';
import { Subscription } from '../entities/subscription.entity';
import { CreateCoachDto, UpdateCoachProfileDto, CreateCertificationDto } from '../dto/coach/coach.dto';

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

    const coach = this.coachRepository.create({
      userId,
      ...coachDto,
    });

    const savedCoach = await this.coachRepository.save(coach);

    // Add specializations
    if (coachDto.specializations && coachDto.specializations.length > 0) {
      const specializations = coachDto.specializations.map(name => 
        this.specializationRepository.create({
          coachId: savedCoach.id,
          name,
        })
      );
      await this.specializationRepository.save(specializations);
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
        status: 'active'
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
        status: 'active',
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
