import { Controller, Get, Put, Body, Delete, Sse } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserService } from './user.service';
import { UpdateUserDto } from '../dto/user/user.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Original endpoints converted to reactive patterns
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    // Convert Observable to Promise for HTTP response
    const userProfile = await this.userService.findUserById(user.id).toPromise();
    return {
      message: 'User profile retrieved successfully',
      user: userProfile,
    };
  }

  @Put('profile')
  async updateProfile(@CurrentUser() user: any, @Body() updateData: UpdateUserDto) {
    // Use reactive update method
    const updatedUser = await this.userService.updateUserProfileReactive(user.id, updateData).toPromise();
    const { password, ...userWithoutPassword } = updatedUser;
    return {
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    };
  }

  // NEW: Server-Sent Events endpoint for real-time dashboard updates
  @Sse('dashboard/stream')
  getDashboardStream(@CurrentUser() user: any): Observable<any> {
    return this.userService.getUserDashboardReactive(user.id).pipe(
      map(data => ({
        data: JSON.stringify({
          type: 'dashboard_update',
          payload: data,
          timestamp: new Date().toISOString()
        })
      }))
    );
  }

  // NEW: Real-time subscription status updates
  @Sse('subscriptions/stream')
  getSubscriptionUpdatesStream(@CurrentUser() user: any): Observable<any> {
    return this.userService.getSubscriptionUpdatesStream(user.id).pipe(
      map(update => ({
        data: JSON.stringify({
          type: 'subscription_update',
          payload: update,
          timestamp: new Date().toISOString()
        })
      }))
    );
  }

  // NEW: Real-time health metrics monitoring
  @Sse('health/stream')
  getHealthMetricsStream(@CurrentUser() user: any): Observable<any> {
    return this.userService.getHealthMetricsStream(user.id).pipe(
      map(metrics => ({
        data: JSON.stringify({
          type: 'health_update',
          payload: metrics,
          timestamp: new Date().toISOString()
        })
      }))
    );
  }

  // Enhanced dashboard with reactive data loading
  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    const dashboardData = await this.userService.getUserDashboardReactive(user.id).toPromise();
    return {
      message: `Welcome to your dashboard, ${user.username}!`,
      data: dashboardData,
    };
  }

  // This endpoint requires authentication
  @Delete('account')
  async deleteAccount(@CurrentUser() user: any) {
    const result = await this.userService.deleteUser(user.id);
    return {
      message: result.message,
      userId: user.id,
    };
  }
}
