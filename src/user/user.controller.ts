import { Controller, Get, Put, Body, Delete } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserService } from './user.service';
import { UpdateUserDto } from '../dto/user/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // This endpoint requires authentication (no @Public decorator)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    const userProfile = await this.userService.getUserProfile(user.id);
    return {
      message: 'User profile retrieved successfully',
      user: userProfile,
    };
  }

  // This endpoint requires authentication
  @Put('profile')
  async updateProfile(@CurrentUser() user: any, @Body() updateData: UpdateUserDto) {
    const updatedUser = await this.userService.updateUserProfile(user.id, updateData);
    const { password, ...userWithoutPassword } = updatedUser;
    return {
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    };
  }

  // This endpoint requires authentication
  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    const dashboardData = await this.userService.getUserDashboard(user.id);
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
