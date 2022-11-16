import { Request, Response, Router } from 'express';
import multer from 'multer';
import Transport from '../../controllers/transport.js';
import appConfig from '../../utils/appConfig.js';
import { FileData } from '../../models/file.js';
import { uploadsDriver } from '../../uploads/index.js';

const router = Router();

const storage = uploadsDriver.createStorageEngine();

/**
 * Multer middleware for image uploading
 */
const imageUploader = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!/image/.test(file.mimetype) && !/video\/mp4/.test(file.mimetype)) {
      cb(null, false);

      return;
    }

    cb(null, true);
  },
}).fields([ {
  name: 'image',
  maxCount: 1,
} ]);

/**
 * Multer middleware for file uploading
 */
const fileUploader = multer({
  storage,
}).fields([ {
  name: 'file',
  maxCount: 1,
} ]);

/**
 * Computes URL to uploaded file
 *
 * @param fileData - file data to process
 */
function getFileUrl(fileData: FileData): string {
  if (appConfig.uploads.driver === 'local') {
    return '/uploads/' + fileData.filename;
  } else {
    const baseUrlWithoutTrailingSlash = appConfig.uploads.s3.baseUrl.replace(/\/+$/, '');

    return baseUrlWithoutTrailingSlash + '/' + fileData.filename;
  }
}

/**
 * Accepts images to upload
 */
router.post('/transport/image', imageUploader, async (req: Request, res: Response) => {
  if (req.files === undefined) {
    res.status(400).json({
      success: 0,
      message: 'No files found',
    });

    return;
  }
  if (!('image' in req.files)) {
    res.status(400).json({
      success: 0,
      message: 'No images found',
    });

    return;
  }

  try {
    const fileData = await Transport.save(req.files.image[0]);
    const url = getFileUrl(fileData);

    res.status(200).json({
      success: 1,
      file: {
        url,
        mime: fileData.mimetype,
        size: fileData.size,
      },
      message: '',
    });
  } catch (e) {
    res.status(500).json({
      success: 0,
      message: e,
    });
  }
});

/**
 * Accepts files to upload
 */
router.post('/transport/file', fileUploader, async (req: Request, res: Response) => {
  if (req.files === undefined) {
    res.status(400).json({
      success: 0,
      message: 'No files found',
    });

    return;
  }
  if (!('file' in req.files)) {
    res.status(400).json({
      success: 0,
      message: 'No file found',
    });

    return;
  }

  try {
    const fileData = await Transport.save(req.files.file[0]);
    const url = getFileUrl(fileData);

    res.status(200).json({
      success: 1,
      file: {
        url,
        mime: fileData.mimetype,
        size: fileData.size,
      },
      message: '',
    });
  } catch (e) {
    res.status(500).json({
      success: 0,
      message: e,
    });
  }
});

/**
 * Accept file url to fetch
 */
router.post('/transport/fetch', multer().none(), async (req: Request, res: Response) => {
  if (!req.body.url) {
    res.status(400).json({
      success: 0,
      message: 'No url provided',
    });

    return;
  }

  try {
    const fileData = await Transport.fetch(req.body.url);
    const url = getFileUrl(fileData);

    res.status(200).json({
      success: 1,
      file: {
        url,
        mime: fileData.mimetype,
        size: fileData.size,
      },
      message: '',
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: 0,
      message: e,
    });
  }
});

export default router;
