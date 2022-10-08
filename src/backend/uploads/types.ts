import multer from 'multer';
import { FileData } from '../models/file.js';

/**
 * Represents common uploads driver functionality
 */
export interface UploadsDriver {
  /**
   * Returns multer storage instance
   */
  createStorageEngine(): multer.StorageEngine

  /**
   * Saves passed file
   *
   * @param data - file data to save
   * @param mimetype - file mimetype
   * @param possibleExtension - possible file extension
   */
  save(data: Buffer, mimetype?: string, possibleExtension?: string): Promise<FileData>;
}
