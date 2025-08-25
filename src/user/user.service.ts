import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/user/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'addresses', 
        'emergencyContacts', 
        'healthMetrics', 
        'medicalHistory', 
        'fitnessGoals',
        'subscriptions',
        'subscriptions.coach',
        'subscriptions.coach.user'
      ]
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserProfile(userId: number): Promise<any> {
    const user = await this.findUserById(userId);
    const { password, ...userWithoutPassword } = user;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      activityLevel: user.activityLevel,
      addresses: user.addresses,
      emergencyContacts: user.emergencyContacts,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUserProfile(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if username or email is being updated and if they're already taken
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username }
      });
      if (existingUser) {
        throw new BadRequestException('Username already exists');
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async getUserDashboard(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'subscriptions',
        'healthMetrics',
        'fitnessGoals',
        'subscriptions.coach',
        'subscriptions.coach.user'
      ]
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeSubscriptions = user.subscriptions?.filter(sub => sub.status === 'active') || [];
    const latestHealthMetrics = user.healthMetrics?.sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0];

    return {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
      },
      stats: {
        activeSubscriptions: activeSubscriptions.length,
        totalWorkouts: user.healthMetrics?.length || 0,
        currentGoals: user.fitnessGoals?.length || 0,
        memberSince: user.createdAt,
      },
      latestMetrics: latestHealthMetrics ? {
        weight: latestHealthMetrics.weight,
        height: latestHealthMetrics.height,
        bmi: latestHealthMetrics.bmi,
        bodyFatPercentage: latestHealthMetrics.bodyFatPercentage,
        recordedAt: latestHealthMetrics.recordedAt,
      } : null,
      activeCoaches: activeSubscriptions.map(sub => ({
        id: sub.coach.id,
        name: `${sub.coach.user.firstName} ${sub.coach.user.lastName}`,
        specializations: sub.coach.specializations?.map(s => s.name) || [],
        subscriptionType: sub.type,
      })),
      recentActivity: {
        lastLogin: new Date().toISOString(),
        weeklyGoalProgress: '75%', // This could be calculated based on actual data
      }
    };
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['subscriptions']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has active subscriptions
    const activeSubscriptions = user.subscriptions?.filter(sub => sub.status === 'active') || [];
    if (activeSubscriptions.length > 0) {
      throw new BadRequestException(
        'Cannot delete account with active subscriptions. Please cancel all subscriptions first.'
      );
    }

    await this.userRepository.remove(user);
    
    return {
      message: 'Account successfully deleted'
    };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'username', 'email', 'firstName', 'lastName', 'createdAt'],
      order: { createdAt: 'DESC' }
    });
  }
}
