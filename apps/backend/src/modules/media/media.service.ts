import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import sharp = require('sharp');
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), 'uploads');

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly s3Client: S3Client | null = null;
  private readonly isR2Configured: boolean;

  constructor(private config: ConfigService) {
    this.isR2Configured = config.get<boolean>('storage.isR2Configured') ?? false;

    if (this.isR2Configured) {
      const accountId = config.get<string>('storage.r2AccountId');
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: config.get<string>('storage.r2AccessKeyId') as string,
          secretAccessKey: config.get<string>('storage.r2SecretAccessKey') as string,
        },
      });
      this.logger.log('MediaService: usando Cloudflare R2');
    } else {
      if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
        fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
      }
      this.logger.warn(
        'MediaService: R2 não configurado — salvando arquivos localmente em /uploads',
      );
    }
  }

  async upload(
    file: Express.Multer.File,
    folder: 'pets' | 'cases' | 'avatars' | 'sightings',
  ): Promise<{ url: string }> {
    this.validateFile(file);

    const compressed = await this.compress(file.buffer, file.mimetype);
    const filename = `${folder}/${randomUUID()}.webp`;

    if (this.isR2Configured) {
      return this.uploadToR2(compressed, filename);
    }

    return this.saveLocally(compressed, filename);
  }

  private validateFile(file: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Formato inválido. Use JPG, PNG ou WebP.');
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('Arquivo muito grande. Máximo 5MB.');
    }
  }

  private async compress(buffer: Buffer, mimetype: string): Promise<Buffer> {
    return sharp(buffer)
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  }

  private async uploadToR2(buffer: Buffer, key: string): Promise<{ url: string }> {
    const bucket = this.config.get<string>('storage.r2Bucket') as string;

    await this.s3Client!.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000',
      }),
    );

    const publicUrl = this.config.get<string>('storage.r2PublicUrl');
    return { url: `${publicUrl}/${key}` };
  }

  private async saveLocally(buffer: Buffer, key: string): Promise<{ url: string }> {
    const filePath = path.join(LOCAL_UPLOADS_DIR, key.replace('/', '-'));
    fs.writeFileSync(filePath, buffer);

    const port = process.env.PORT ?? 3000;
    const filename = path.basename(filePath);
    return { url: `http://localhost:${port}/uploads/${filename}` };
  }
}
