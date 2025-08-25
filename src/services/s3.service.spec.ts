import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock AWS S3 SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('S3Service', () => {
  let service: S3Service;
  let mockS3Client: jest.Mocked<S3Client>;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-video.mp4',
    encoding: '7bit',
    mimetype: 'video/mp4',
    size: 1024000,
    buffer: Buffer.from('test file content'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any
  };

  beforeEach(async () => {
    const mockS3ClientInstance = {
      send: jest.fn(),
    };

    (S3Client as jest.Mock).mockImplementation(() => mockS3ClientInstance);
    mockS3Client = mockS3ClientInstance as jest.Mocked<S3Client>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'AWS_REGION': 'us-east-1',
                'AWS_ACCESS_KEY_ID': 'test-key',
                'AWS_SECRET_ACCESS_KEY': 'test-secret',
                'AWS_S3_BUCKET_NAME': 'test-bucket'
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file to S3 successfully', async () => {
      mockS3Client.send.mockResolvedValue({} as any);

      const result = await service.uploadFile(mockFile, 'test-folder', true);

      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(result.bucket).toBe('test-bucket');
      expect(result.key).toContain('test-folder/');
    });
  });

  describe('deleteFile', () => {
    it('should delete file from S3 successfully', async () => {
      mockS3Client.send.mockResolvedValue({} as any);
      await service.deleteFile('test-key');
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });
  });

  describe('getPresignedUploadUrl', () => {
    it('should generate a presigned URL', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue('https://presigned-url.com');
      const result = await service.getPresignedUploadUrl('test.mp4', 'video/mp4');
      expect(getSignedUrl).toHaveBeenCalled();
      expect(result.uploadUrl).toBe('https://presigned-url.com');
    });
  });
});

