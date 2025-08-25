import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/user/user.dto';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { RealtimeService } from '../services/realtime.service';
import { AsyncOperationsService } from '../services/async-operations.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private realtimeService: RealtimeService,
    private asyncOperationsService: AsyncOperationsService,
  ) {}

  // Convert existing method to return Observable for reactive patterns
  findUserById(id: number): Observable<User> {
    return from(this.userRepository.findOne({
      where: { id },
      relations: ['addresses', 'emergencyContacts', 'subscriptions']
    })).pipe(
      map(user => {
        if (!user) {
          throw new NotFoundException('User not found');
        }
        return user;
      }),
      catchError(error => {
        console.error('Error finding user:', error);
        throw error;
      })
    );
  }

  // Enhanced dashboard with RxJS reactive data loading
  getUserDashboardReactive(userId: number): Observable<any> {
    return this.asyncOperationsService.getUserDashboardData(userId).pipe(
      tap(dashboardData => {
        // Emit real-time update for this user's dashboard
        this.realtimeService.updateSubscriptionStatus(
          userId, 
          'dashboard_loaded', 
          { timestamp: new Date() }
        );
      }),
      catchError(error => {
        console.error('Dashboard loading error:', error);
        return of({ error: 'Failed to load dashboard data' });
      })
    );
  }

  // Real-time user profile updates
  updateUserProfileReactive(userId: number, updateUserDto: UpdateUserDto): Observable<User> {
    return this.findUserById(userId).pipe(
      switchMap(user => {
        // Batch validation for username/email uniqueness
        const validationPromises = [];
        
        if (updateUserDto.username && updateUserDto.username !== user.username) {
          validationPromises.push(
            this.userRepository.findOne({ where: { username: updateUserDto.username } })
              .then(existingUser => {
                if (existingUser) {
                  throw new BadRequestException('Username already exists');
                }
              })
          );
        }

        if (updateUserDto.email && updateUserDto.email !== user.email) {
          validationPromises.push(
            this.userRepository.findOne({ where: { email: updateUserDto.email } })
              .then(existingUser => {
                if (existingUser) {
                  throw new BadRequestException('Email already exists');
                }
              })
          );
        }

        return from(Promise.all(validationPromises)).pipe(
          switchMap(() => {
            // Hash password if it's being updated
            if (updateUserDto.password) {
              return from(bcrypt.hash(updateUserDto.password, 10)).pipe(
                map(hashedPassword => ({ ...updateUserDto, password: hashedPassword }))
              );
            }
            return of(updateUserDto);
          }),
          switchMap(finalUpdateDto => {
            Object.assign(user, finalUpdateDto);
            return from(this.userRepository.save(user));
          })
        );
      }),
      tap(updatedUser => {
        // Emit real-time profile update
        this.realtimeService.updateSubscriptionStatus(
          userId,
          'profile_updated',
          { 
            updatedFields: Object.keys(updateUserDto),
            timestamp: new Date()
          }
        );
      })
    );
  }

  // Stream health metrics updates
  getHealthMetricsStream(userId: number): Observable<any> {
    return this.realtimeService.monitorHealthMetrics(userId);
  }

  // Get real-time subscription updates
  getSubscriptionUpdatesStream(userId: number): Observable<any> {
    return this.realtimeService.getSubscriptionUpdates(userId);
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
