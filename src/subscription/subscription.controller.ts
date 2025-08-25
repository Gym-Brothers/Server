import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto, CancelSubscriptionDto } from '../dto/subscription/subscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Public()
  @Get('pricing')
  async getSubscriptionPricing() {
    try {
      const pricing = await this.subscriptionService.getSubscriptionPricing();
      
      return {
        message: 'Subscription pricing retrieved successfully',
        data: pricing,
      };
    } catch (error) {
      throw new Error('Failed to retrieve pricing: ' + error.message);
    }
  }

  @Post()
  async createSubscription(@CurrentUser() user: any, @Body() subscriptionDto: CreateSubscriptionDto) {
    try {
      const subscription = await this.subscriptionService.createSubscription(user.id, subscriptionDto);
      
      return {
        message: 'Subscription created successfully',
        data: subscription,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Failed to create subscription: ' + error.message);
    }
  }

  @Get()
  async getMySubscriptions(@CurrentUser() user: any) {
    try {
      const subscriptions = await this.subscriptionService.getMySubscriptions(user.id);
      
      return {
        message: 'Subscriptions retrieved successfully',
        data: subscriptions,
      };
    } catch (error) {
      throw new Error('Failed to retrieve subscriptions: ' + error.message);
    }
  }

  @Get(':id')
  async getSubscriptionDetails(@CurrentUser() user: any, @Param('id') id: string) {
    try {
      const subscription = await this.subscriptionService.getSubscriptionDetails(user.id, parseInt(id));
      
      return {
        message: 'Subscription details retrieved successfully',
        data: subscription,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to retrieve subscription details: ' + error.message);
    }
  }

  @Put(':id')
  async updateSubscription(
    @CurrentUser() user: any, 
    @Param('id') id: string, 
    @Body() updateDto: UpdateSubscriptionDto
  ) {
    try {
      const updatedSubscription = await this.subscriptionService.updateSubscription(
        user.id, 
        parseInt(id), 
        updateDto
      );
      
      return {
        message: 'Subscription updated successfully',
        data: updatedSubscription,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Failed to update subscription: ' + error.message);
    }
  }

  @Post(':id/cancel')
  async cancelSubscription(
    @CurrentUser() user: any, 
    @Param('id') id: string, 
    @Body() cancelDto: CancelSubscriptionDto
  ) {
    try {
      const result = await this.subscriptionService.cancelSubscription(
        user.id, 
        parseInt(id), 
        cancelDto
      );
      
      return {
        message: 'Subscription cancelled successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Failed to cancel subscription: ' + error.message);
    }
  }

  @Post(':id/renew')
  async renewSubscription(@CurrentUser() user: any, @Param('id') id: string) {
    try {
      const result = await this.subscriptionService.renewSubscription(user.id, parseInt(id));
      
      return {
        message: 'Subscription renewed successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to renew subscription: ' + error.message);
    }
  }

  @Get('analytics/usage')
  async getSubscriptionAnalytics(@CurrentUser() user: any) {
    try {
      const analytics = await this.subscriptionService.getSubscriptionAnalytics(user.id);
      
      return {
        message: 'Subscription analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      throw new Error('Failed to retrieve analytics: ' + error.message);
    }
  }
}
