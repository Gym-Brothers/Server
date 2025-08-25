import 'reflect-metadata';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

// Mock external services
jest.mock('@aws-sdk/client-s3');
jest.mock('bcryptjs');

// Global test utilities
global.mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  coach: { id: 1 }
};

global.mockCoach = {
  id: 1,
  userId: 1,
  bio: 'Test coach',
  yearsOfExperience: 5,
  hourlyRate: 50.00,
  isVerified: true
};
