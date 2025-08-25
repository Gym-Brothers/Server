import { Controller, Get, Put, Body, Delete, Param } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';

export class UpdateProfileDto {
  username?: string;
  email?: string;
}

@Controller('user')
export class UserController {
  // This endpoint requires authentication (no @Public decorator)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return {
      message: 'User profile retrieved successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  // This endpoint requires authentication
  @Put('profile')
  updateProfile(@CurrentUser() user: any, @Body() updateData: UpdateProfileDto) {
    return {
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: updateData.username || user.username,
        email: updateData.email || user.email,
      },
    };
  }

  // This endpoint requires authentication
  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return {
      message: `Welcome to your dashboard, ${user.username}!`,
      data: {
        workouts: 15,
        totalExercises: 45,
        weeklyGoal: '80%',
        lastLogin: new Date().toISOString(),
      },
    };
  }

  // This endpoint requires authentication
  @Delete('account')
  deleteAccount(@CurrentUser() user: any) {
    return {
      message: `Account deletion requested for user: ${user.username}`,
      userId: user.id,
      note: 'This is a demo endpoint - account not actually deleted',
    };
  }
}
