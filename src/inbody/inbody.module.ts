import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InBodyController } from '../controllers/inbody.controller';
import { InBodyService } from '../services/inbody.service';
import { InBodyTest } from '../entities/inbody-test.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InBodyTest, User])],
  controllers: [InBodyController],
  providers: [InBodyService],
  exports: [InBodyService],
})
export class InBodyModule {}
