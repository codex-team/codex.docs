import { UploadsDriver } from './types.js';
import multer from 'multer';
import mkdirp from 'mkdirp';
import { random16 } from '../utils/crypto.js';
import mime from 'mime';
import appConfig, { LocalUploadsConfig } from '../utils/appConfig.js';
import fs from 'fs';
import fileType from 'file-type';
import { FileData } from '../models/file.js';

/**
 * Uploads driver for local storage
 */
export default class LocalUploadsDriver implements UploadsDriver {
  /**
   * Configuration for local uploads
   */
  private readonly config: LocalUploadsConfig;

  /**
   * Create a new instance of LocalUploadsDriver
   *
   * @param config - configuration for local uploads
   */
  constructor(config: LocalUploadsConfig) {
    this.config = config;
  }


  /**
   * Creates multer storage engine for local uploads
   */
  public createStorageEngine(): multer.StorageEngine {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const dir: string = this.config.local.path;

        mkdirp(dir);
        cb(null, dir);
      },
      filename: async (req, file, cb) => {
        const filename = await random16();

        cb(null, `${filename}.${mime.getExtension(file.mimetype)}`);
      },
    });
  }

  /**
   * Saves passed file to the local storage
   *
   * @param data - file data to save
   * @param mimetype - file mimetype
   * @param possibleExtension
   */
  public async save(data: Buffer, mimetype?: string, possibleExtension?: string): Promise<FileData> {
    const filename = await random16();

    const type = await fileType.fromBuffer(data);
    const ext = type ? type.ext : possibleExtension;
    const fullName = `${filename}.${ext}`;

    fs.writeFileSync(`${appConfig.uploads}/${fullName}`, data);

    return {
      name: fullName,
      filename: fullName,
      size: data.length,
      mimetype,
    };
  }
}
