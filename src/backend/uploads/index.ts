import appConfig from '../utils/appConfig.js';
import S3UploadsDriver from './s3.js';
import LocalUploadsDriver from './local.js';

/**
 * Initialize the uploads driver based on the configuration
 */
export const uploadsDriver = appConfig.uploads.driver === 'local'
  ? new LocalUploadsDriver(appConfig.uploads)
  : new S3UploadsDriver(appConfig.uploads);
