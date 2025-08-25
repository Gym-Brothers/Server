import { Controller, Post, Body, Get, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorators/public.decorator';
import { CreateUserDto } from '../dto/user/user.dto';

export class LoginDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: CreateUserDto) {
    try {
      if (!registerDto.username || !registerDto.email || !registerDto.password) {
        throw new BadRequestException('Username, email, and password are required');
      }

      // Convert date string to Date object
      const userData = {
        ...registerDto,
        dateOfBirth: new Date(registerDto.dateOfBirth),
      };

      const user = await this.authService.register(userData);
      
      return {
        message: 'User registered successfully',
        user,
      };
    } catch (error) {
      if (error.message === 'User already exists') {
        throw new BadRequestException('Username or email already exists');
      }
      throw new BadRequestException('Registration failed: ' + error.message);
    }
  }

  @Public()
  @Get('info')
  async getPublicInfo() {
    return {
      message: 'Welcome to Gym Server API - Public Information',
      version: '1.0.0',
      features: [
        'User Authentication',
        'Workout Tracking',
        'Exercise Database',
        'Progress Monitoring'
      ],
      endpoints: {
        public: [
          'GET /auth/info - This endpoint (public)',
          'POST /auth/login - User login (public)',
          'POST /auth/register - User registration (public)'
        ],
        protected: [
          'All other endpoints require authentication'
        ]
      }
    };
  }
}
