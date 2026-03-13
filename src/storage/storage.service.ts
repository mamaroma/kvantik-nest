import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Express } from 'express';

@Injectable()
export class StorageService {
    private readonly client: S3Client | null;
    private readonly bucket: string | undefined;
    private readonly publicBaseUrl: string | undefined;

    constructor(private readonly configService: ConfigService) {
        const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');
        this.bucket = this.configService.get<string>('S3_BUCKET');
        const region = this.configService.get<string>('S3_REGION') ?? 'ru-central1';
        const endpoint = this.configService.get<string>('S3_ENDPOINT') ?? 'https://storage.yandexcloud.net';
        this.publicBaseUrl = this.configService.get<string>('S3_PUBLIC_BASE_URL');

        if (!accessKeyId || !secretAccessKey || !this.bucket) {
            this.client = null;
            return;
        }

        this.client = new S3Client({
            region,
            endpoint,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    isConfigured() {
        return Boolean(this.client && this.bucket);
    }

    async uploadPublicFile(file: Express.Multer.File, prefix = 'uploads') {
        if (!this.client || !this.bucket) {
            throw new ServiceUnavailableException(
                'Объектное хранилище не настроено. Заполните S3_BUCKET, S3_ACCESS_KEY_ID и S3_SECRET_ACCESS_KEY.',
            );
        }

        const extension = extname(file.originalname || '') || this.extensionByMimeType(file.mimetype);
        const key = `${prefix}/${Date.now()}-${randomUUID()}${extension}`;

        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        return {
            key,
            bucket: this.bucket,
            url: this.buildPublicUrl(key),
        };
    }

    private buildPublicUrl(key: string) {
        const normalizedKey = key
            .split('/')
            .map((part) => encodeURIComponent(part))
            .join('/');

        if (this.publicBaseUrl) {
            return `${this.publicBaseUrl.replace(/\/$/, '')}/${normalizedKey}`;
        }

        return `https://${this.bucket}.storage.yandexcloud.net/${normalizedKey}`;
    }

    private extensionByMimeType(mimeType?: string) {
        switch (mimeType) {
            case 'image/jpeg':
                return '.jpg';
            case 'image/png':
                return '.png';
            case 'image/webp':
                return '.webp';
            case 'image/gif':
                return '.gif';
            default:
                return '';
        }
    }
}
