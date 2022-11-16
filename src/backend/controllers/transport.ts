import fetch from 'node-fetch';
import nodePath from 'path';
import File, { FileData } from '../models/file.js';
import { uploadsDriver } from '../uploads/index.js';

/**
 * Represents file data from multer
 */
interface MulterLocalFile {
  originalname: string;
  mimetype: string;
  filename: string;
  size: number;
}

/**
 * Represents file data from multer S3 plugin
 */
interface MulterS3File {
  originalname: string
  mimetype: string
  key: string
  size: number
}

/**
 * Represents file data from multer (both local and s3 plugins)
 */
type MulterFile = MulterLocalFile | MulterS3File;

/**
 * Transport controller allows to save files from client or fetch them by URL
 */
class Transport {
  /**
   * Saves file passed from client
   *
   * @param fileData - file data to save
   */
  public static async save(fileData: MulterFile): Promise<FileData> {
    const file = new File({
      name: fileData.originalname,
      filename: 'filename' in fileData? fileData.filename : fileData.key,
      mimetype: fileData.mimetype,
      size: fileData.size,
    });

    await file.save();

    return file.data;
  }

  /**
   * Fetches file by passed URL
   *
   * @param {string} url - URL of the file
   * @returns {Promise<FileData>}
   */
  public static async fetch(url: string): Promise<FileData> {
    const fetchedFile = await fetch(url);
    const buffer = Buffer.from(await fetchedFile.arrayBuffer());
    const fetchedContentType = fetchedFile.headers.get('content-type');
    const fetchedMimeType = fetchedContentType ? fetchedContentType : undefined;

    const fileData = await uploadsDriver.save(buffer, fetchedMimeType, nodePath.extname(url).slice(1));

    const file = new File(fileData);

    await file.save();

    return file.data;
  }
}

export default Transport;
