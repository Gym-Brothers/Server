import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaType, MediaCategory } from '../entities/media.entity';
import { S3Service } from './s3.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private s3Service: S3Service,
  ) {}

  async uploadMedia(
    coachId: number,
    file: Express.Multer.File,
    metadata: {
      title: string;
      description?: string;
      type: MediaType;
      category: MediaCategory;
      exerciseId?: number;
      trainingProgramId?: number;
      isPublic?: boolean;
    }
  ): Promise<Media> {
    const folder = `coaches/${coachId}/${metadata.category}`;
    const uploadResult = await this.s3Service.uploadFile(file, folder, metadata.isPublic || false);

    const media = this.mediaRepository.create({
      coachId,
      exerciseId: metadata.exerciseId,
      trainingProgramId: metadata.trainingProgramId,
      title: metadata.title,
      description: metadata.description,
      type: metadata.type,
      category: metadata.category,
      fileName: uploadResult.fileName,
      originalName: file.originalname,
      s3Key: uploadResult.key,
      s3Bucket: uploadResult.bucket,
      fileSize: file.size,
      mimeType: file.mimetype,
      publicUrl: uploadResult.url,
      isPublic: metadata.isPublic || false,
    });

    return this.mediaRepository.save(media);
  }

  async uploadVideoWithThumbnail(
    coachId: number,
    videoFile: Express.Multer.File,
    thumbnailFile: Express.Multer.File,
    metadata: {
      title: string;
      description?: string;
      category: MediaCategory;
      exerciseId?: number;
      trainingProgramId?: number;
      durationSeconds?: number;
      isPublic?: boolean;
    }
  ): Promise<Media> {
    const folder = `coaches/${coachId}/${metadata.category}`;
    const { video, thumbnail } = await this.s3Service.uploadVideoWithThumbnail(
      videoFile,
      thumbnailFile,
      folder
    );

    const media = this.mediaRepository.create({
      coachId,
      exerciseId: metadata.exerciseId,
      trainingProgramId: metadata.trainingProgramId,
      title: metadata.title,
      description: metadata.description,
      type: MediaType.VIDEO,
      category: metadata.category,
      fileName: video.fileName,
      originalName: videoFile.originalname,
      s3Key: video.key,
      s3Bucket: video.bucket,
      fileSize: videoFile.size,
      mimeType: videoFile.mimetype,
      durationSeconds: metadata.durationSeconds,
      thumbnailS3Key: thumbnail.key,
      publicUrl: video.url,
      isPublic: metadata.isPublic || false,
    });

    return this.mediaRepository.save(media);
  }

  async getCoachMedia(coachId: number, category?: MediaCategory): Promise<Media[]> {
    const query = this.mediaRepository
      .createQueryBuilder('media')
      .where('media.coachId = :coachId', { coachId });

    if (category) {
      query.andWhere('media.category = :category', { category });
    }

    return query.orderBy('media.createdAt', 'DESC').getMany();
  }

  async getExerciseMedia(exerciseId: number): Promise<Media[]> {
    return this.mediaRepository.find({
      where: { exerciseId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTrainingProgramMedia(trainingProgramId: number): Promise<Media[]> {
    return this.mediaRepository.find({
      where: { trainingProgramId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPublicMedia(category?: MediaCategory): Promise<Media[]> {
    const query = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.coach', 'coach')
      .leftJoinAndSelect('coach.user', 'user')
      .where('media.isPublic = :isPublic', { isPublic: true });

    if (category) {
      query.andWhere('media.category = :category', { category });
    }

    return query.orderBy('media.viewCount', 'DESC').getMany();
  }

  async incrementViewCount(mediaId: number): Promise<void> {
    await this.mediaRepository.increment({ id: mediaId }, 'viewCount', 1);
  }

  async deleteMedia(mediaId: number, coachId: number): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, coachId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete from S3
    await this.s3Service.deleteFile(media.s3Key);
    if (media.thumbnailS3Key) {
      await this.s3Service.deleteFile(media.thumbnailS3Key);
    }

    // Delete from database
    await this.mediaRepository.remove(media);
  }

  async getPresignedUploadUrl(
    coachId: number,
    fileName: string,
    contentType: string,
    category: MediaCategory
  ): Promise<{ uploadUrl: string; key: string }> {
    const folder = `coaches/${coachId}/${category}`;
    return this.s3Service.getPresignedUploadUrl(fileName, contentType, folder);
  }
}
