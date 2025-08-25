import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload: JwtPayload = { 
      username: user.username, 
      sub: user.id,
      email: user.email 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async register(createUserData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: any;
    phoneNumber: string;
    activityLevel: any;
  }) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserData.username },
        { email: createUserData.email }
      ]
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserData.password, 10);
    const newUser = this.userRepository.create({
      ...createUserData,
      password: hashedPassword,
    });
    
    const savedUser = await this.userRepository.save(newUser);
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async findUserById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['addresses', 'emergencyContacts', 'healthMetrics', 'medicalHistory', 'fitnessGoals']
    });
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { username },
    });
  }
}
