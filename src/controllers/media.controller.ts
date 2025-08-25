import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { MediaService } from '../services/media.service';
import { MediaType, MediaCategory } from '../entities/media.entity';

@Controller('api/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 2))
  async uploadMedia(
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('metadata') metadataStr: string,
  ) {
    const metadata = JSON.parse(metadataStr);
    
    if (files.length === 2) {
      // Video with thumbnail
      const [videoFile, thumbnailFile] = files;
      return this.mediaService.uploadVideoWithThumbnail(
        user.coach.id,
        videoFile,
        thumbnailFile,
        metadata
      );
    } else {
      // Single file
      return this.mediaService.uploadMedia(user.coach.id, files[0], metadata);
    }
  }

  @Get('coach/:coachId')
  async getCoachMedia(
    @Param('coachId', ParseIntPipe) coachId: number,
    @Query('category') category?: MediaCategory,
  ) {
    return this.mediaService.getCoachMedia(coachId, category);
  }

  @Get('exercise/:exerciseId')
  async getExerciseMedia(@Param('exerciseId', ParseIntPipe) exerciseId: number) {
    return this.mediaService.getExerciseMedia(exerciseId);
  }

  @Get('program/:programId')
  async getProgramMedia(@Param('programId', ParseIntPipe) programId: number) {
    return this.mediaService.getTrainingProgramMedia(programId);
  }

  @Get('public')
  async getPublicMedia(@Query('category') category?: MediaCategory) {
    return this.mediaService.getPublicMedia(category);
  }

  @Put(':mediaId/view')
  async incrementViewCount(@Param('mediaId', ParseIntPipe) mediaId: number) {
    await this.mediaService.incrementViewCount(mediaId);
    return { success: true };
  }

  @Delete(':mediaId')
  async deleteMedia(
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @CurrentUser() user: any,
  ) {
    await this.mediaService.deleteMedia(mediaId, user.coach.id);
    return { success: true };
  }

  @Post('upload-url')
  async getPresignedUploadUrl(
    @CurrentUser() user: any,
    @Body() body: { fileName: string; contentType: string; category: MediaCategory },
  ) {
    return this.mediaService.getPresignedUploadUrl(
      user.coach.id,
      body.fileName,
      body.contentType,
      body.category,
    );
  }
}
