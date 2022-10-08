import { UploadsDriver } from './types.js';
import multerS3 from 'multer-s3';
import { random16 } from '../utils/crypto.js';
import path from 'path';
import mime from 'mime';
import multer from 'multer';
import { S3UploadsConfig } from '../utils/appConfig.js';
import { FileData } from '../models/file.js';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fileType from 'file-type';

/**
 * Uploads driver for S3 storage
 */
export default class S3UploadsDriver implements UploadsDriver {
  /**
   * Configuration for S3 uploads
   */
  private readonly config: S3UploadsConfig;

  /**
   * S3 client for uploads
   */
  private readonly s3Client: S3Client;

  /**
   * Create a new instance of S3UploadsDriver
   *
   * @param config - configuration for s3 uploads
   */
  constructor(config: S3UploadsConfig) {
    this.config = config;
    this.s3Client = new S3Client({
      region: this.config.s3.region,
      credentials: {
        accessKeyId: this.config.s3.accessKeyId,
        secretAccessKey: this.config.s3.secretAccessKey,
      },
    });
  }

  /**
   * Creates multer storage engine for S3
   */
  public createStorageEngine(): multer.StorageEngine {
    const config = this.config;

    return multerS3({
      s3: this.s3Client,
      bucket: config.s3.bucket,
      key: async function (req, file, cb) {
        const filename = await random16();

        cb(null, path.posix.join(config.s3.keyPrefix, `${filename}.${mime.getExtension(file.mimetype)}`));
      },
    });
  }

  /**
   * Saves passed file to the storage
   *
   * @param data - file data to save
   * @param mimetype - file mimetype
   * @param possibleExtension - possible file extension
   */
  public async save(data: Buffer, mimetype?: string, possibleExtension?: string): Promise<FileData> {
    const filename = await random16();

    const type = await fileType.fromBuffer(data);
    const ext = type ? type.ext : possibleExtension;
    const fullName = `${filename}.${ext}`;
    const fileKey = path.posix.join(this.config.s3.keyPrefix, fullName);

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.config.s3.bucket,
      Key: fileKey,
      Body: data,
      ContentType: mimetype,
    }));

    return {
      name: fileKey,
      filename: fileKey,
      size: data.length,
      mimetype,
    };
  }
}
