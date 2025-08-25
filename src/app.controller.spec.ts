import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Welcome to the Gym Server API! 🏋️‍♂️"', () => {
      expect(appController.getHello()).toBe('Welcome to the Gym Server API! 🏋️‍♂️');
    });
  });

  describe('health', () => {
    it('should return health status object', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status', 'OK');
      expect(result).toHaveProperty('message', 'Gym Server is running successfully!');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
