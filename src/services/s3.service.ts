import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  bucket: string;
  url: string;
  fileName: string;
}

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get('AWS_S3_BUCKET_NAME') || 'gym-app-media';
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    isPublic: boolean = false
  ): Promise<UploadResult> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: isPublic ? ObjectCannedACL.public_read : ObjectCannedACL.private,
      Metadata: {
        originalName: file.originalname,
        uploadDate: new Date().toISOString(),
      },
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      
      const url = isPublic 
        ? `https://${this.bucketName}.s3.amazonaws.com/${key}`
        : await this.getSignedUrl(key);

      return {
        key,
        bucket: this.bucketName,
        url,
        fileName,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadVideoWithThumbnail(
    videoFile: Express.Multer.File,
    thumbnailFile: Express.Multer.File,
    folder: string = 'videos'
  ): Promise<{ video: UploadResult; thumbnail: UploadResult }> {
    const videoResult = await this.uploadFile(videoFile, folder, true);
    const thumbnailResult = await this.uploadFile(thumbnailFile, `${folder}/thumbnails`, true);

    return {
      video: videoResult,
      thumbnail: thumbnailResult,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    folder: string = 'uploads'
  ): Promise<{ uploadUrl: string; key: string }> {
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return { uploadUrl, key };
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }
}
