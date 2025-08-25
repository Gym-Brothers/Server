import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { InBodyService } from '../services/inbody.service';
import { InBodyTest } from '../entities/inbody-test.entity';

@Controller('api/inbody')
@UseGuards(JwtAuthGuard)
export class InBodyController {
  constructor(private readonly inBodyService: InBodyService) {}

  @Post('test')
  async createInBodyTest(
    @CurrentUser() user: any,
    @Body() testData: Partial<InBodyTest>,
  ) {
    return this.inBodyService.createInBodyTest(user.id, testData);
  }

  @Get('tests')
  async getUserInBodyTests(@CurrentUser() user: any) {
    return this.inBodyService.getUserInBodyTests(user.id);
  }

  @Get('latest')
  async getLatestInBodyTest(@CurrentUser() user: any) {
    return this.inBodyService.getLatestInBodyTest(user.id);
  }

  @Get('analysis/:testId')
  async getInBodyAnalysis(
    @Param('testId', ParseIntPipe) testId: number,
    @CurrentUser() user: any,
  ) {
    const tests = await this.inBodyService.getUserInBodyTests(user.id);
    const test = tests.find(t => t.id === testId);
    
    if (!test) {
      throw new Error('InBody test not found');
    }

    return this.inBodyService.analyzeInBodyData(test, user);
  }

  @Get('progress')
  async getProgressAnalysis(@CurrentUser() user: any) {
    const tests = await this.inBodyService.getUserInBodyTests(user.id);
    
    if (tests.length < 2) {
      return { message: 'Need at least 2 tests for progress analysis' };
    }

    const latest = tests[0];
    const previous = tests[1];

    return {
      weightChange: latest.weight - previous.weight,
      bodyFatChange: latest.bodyFatPercentage - previous.bodyFatPercentage,
      muscleMassChange: latest.skeletalMuscleMass - previous.skeletalMuscleMass,
      waterChange: latest.totalBodyWater - previous.totalBodyWater,
      bmrChange: latest.basalMetabolicRate - previous.basalMetabolicRate,
      testPeriod: {
        from: previous.testDate,
        to: latest.testDate,
        days: Math.floor((latest.testDate.getTime() - previous.testDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    };
  }
}
