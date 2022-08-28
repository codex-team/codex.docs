import { Request, Response, Router } from 'express';
import multer, { StorageEngine } from 'multer';
import mime from 'mime';
import mkdirp from 'mkdirp';
import config from 'config';
import Transport from '../../controllers/transport.js';
import { random16 } from '../../utils/crypto.js';

const router = Router();

/**
 * Multer storage for uploaded files and images
 *
 * @type {StorageEngine}
 */
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir: string = config.get('uploads') || 'public/uploads';

    mkdirp(dir);
    cb(null, dir);
  },
  filename: async (req, file, cb) => {
    const filename = await random16();

    cb(null, `${filename}.${mime.getExtension(file.mimetype)}`);
  },
});

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
  storage: storage,
}).fields([ {
  name: 'file',
  maxCount: 1,
} ]);

/**
 * Accepts images to upload
 */
router.post('/transport/image', imageUploader, async (req: Request, res: Response) => {
  const response = {
    success: 0,
    message: '',
  };

  if (req.files === undefined) {
    response.message = 'No files found';
    res.status(400).json(response);

    return;
  }
  if (!('image' in req.files)) {
    res.status(400).json(response);

    return;
  }

  const fileData = {
    ...req.files.image[0],
    url: '/uploads/' + req.files.image[0].filename,
  };

  console.log(fileData);

  try {
    Object.assign(
      response,
      await Transport.save(fileData, req.body.map ? JSON.parse(req.body.map) : undefined)
    );

    response.success = 1;
    res.status(200).json(response);
  } catch (e) {
    res.status(500).json(response);
  }
});

/**
 * Accepts files to upload
 */
router.post('/transport/file', fileUploader, async (req: Request, res: Response) => {
  const response = { success: 0 };

  if (req.files === undefined) {
    res.status(400).json(response);

    return;
  }
  if (!('file' in req.files)) {
    res.status(400).json(response);

    return;
  }

  try {
    Object.assign(
      response,
      await Transport.save(req.files.file[0], req.body.map ? JSON.parse(req.body.map) : undefined)
    );

    response.success = 1;
    res.status(200).json(response);
  } catch (e) {
    res.status(500).json(response);
  }
});

/**
 * Accept file url to fetch
 */
router.post('/transport/fetch', multer().none(), async (req: Request, res: Response) => {
  const response = { success: 0 };

  if (!req.body.url) {
    res.status(400).json(response);

    return;
  }

  try {
    Object.assign(response, await Transport.fetch(req.body.url, req.body.map ? JSON.parse(req.body.map) : undefined));

    response.success = 1;
    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(response);
  }
});

export default router;
