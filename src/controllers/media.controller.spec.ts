import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from '../services/media.service';
import { MediaType, MediaCategory } from '../entities/media.entity';

describe('MediaController', () => {
  let controller: MediaController;
  let mediaService: MediaService;

  const mockUser = { id: 1, coach: { id: 1 } };

  const mockMedia = {
    id: 1,
    title: 'Proper Squat Form',
    type: MediaType.VIDEO,
    category: MediaCategory.EXERCISE_DEMO,
    publicUrl: 'https://s3.amazonaws.com/test-video.mp4',
    fileSize: 1024000,
    createdAt: new Date()
  };

  const mockFiles: Express.Multer.File[] = [{
    fieldname: 'files',
    originalname: 'test-video.mp4',
    encoding: '7bit',
    mimetype: 'video/mp4',
    size: 1024000,
    buffer: Buffer.from('test'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any
  }];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: {
            uploadMedia: jest.fn().mockResolvedValue(mockMedia),
            uploadVideoWithThumbnail: jest.fn().mockResolvedValue(mockMedia),
            getCoachMedia: jest.fn().mockResolvedValue([mockMedia]),
            getExerciseMedia: jest.fn().mockResolvedValue([mockMedia]),
            getTrainingProgramMedia: jest.fn().mockResolvedValue([mockMedia]),
            getPublicMedia: jest.fn().mockResolvedValue([mockMedia]),
            incrementViewCount: jest.fn().mockResolvedValue(undefined),
            deleteMedia: jest.fn().mockResolvedValue(undefined),
            getPresignedUploadUrl: jest.fn().mockResolvedValue({
              uploadUrl: 'https://presigned-url.com',
              key: 'uploads/test-file.mp4'
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    mediaService = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadMedia', () => {
    it('should upload single media file', async () => {
      const metadata = JSON.stringify({
        title: 'Test Video',
        type: MediaType.VIDEO,
        category: MediaCategory.EXERCISE_DEMO,
        isPublic: true
      });

      const result = await controller.uploadMedia(mockUser, mockFiles, metadata);

      expect(mediaService.uploadMedia).toHaveBeenCalledWith(
        1,
        mockFiles[0],
        expect.objectContaining({
          title: 'Test Video',
          type: MediaType.VIDEO,
          category: MediaCategory.EXERCISE_DEMO,
          isPublic: true
        })
      );
      expect(result).toEqual(mockMedia);
    });

    it('should upload video with thumbnail when two files provided', async () => {
      const videoAndThumbnail = [
        mockFiles[0],
        { ...mockFiles[0], originalname: 'thumbnail.jpg', mimetype: 'image/jpeg' }
      ];

      const metadata = JSON.stringify({
        title: 'Test Video with Thumbnail',
        category: MediaCategory.EXERCISE_DEMO
      });

      const result = await controller.uploadMedia(mockUser, videoAndThumbnail, metadata);

      expect(mediaService.uploadVideoWithThumbnail).toHaveBeenCalledWith(
        1,
        videoAndThumbnail[0],
        videoAndThumbnail[1],
        expect.any(Object)
      );
      expect(result).toEqual(mockMedia);
    });
  });

  describe('getCoachMedia', () => {
    it('should return coach media with optional category filter', async () => {
      const result = await controller.getCoachMedia(1, MediaCategory.EXERCISE_DEMO);

      expect(mediaService.getCoachMedia).toHaveBeenCalledWith(1, MediaCategory.EXERCISE_DEMO);
      expect(result).toEqual([mockMedia]);
    });
  });

  describe('getExerciseMedia', () => {
    it('should return exercise-specific media', async () => {
      const result = await controller.getExerciseMedia(1);

      expect(mediaService.getExerciseMedia).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockMedia]);
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count and return success', async () => {
      const result = await controller.incrementViewCount(1);

      expect(mediaService.incrementViewCount).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true });
    });
  });

  describe('deleteMedia', () => {
    it('should delete media and return success', async () => {
      const result = await controller.deleteMedia(1, mockUser);

      expect(mediaService.deleteMedia).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({ success: true });
    });
  });

  describe('getPresignedUploadUrl', () => {
    it('should return presigned upload URL', async () => {
      const body = {
        fileName: 'test-video.mp4',
        contentType: 'video/mp4',
        category: MediaCategory.EXERCISE_DEMO
      };

      const result = await controller.getPresignedUploadUrl(mockUser, body);

      expect(mediaService.getPresignedUploadUrl).toHaveBeenCalledWith(
        1,
        'test-video.mp4',
        'video/mp4',
        MediaCategory.EXERCISE_DEMO
      );
      expect(result).toEqual({
        uploadUrl: 'https://presigned-url.com',
        key: 'uploads/test-file.mp4'
      });
    });
  });
});

