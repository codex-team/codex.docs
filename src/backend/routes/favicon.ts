import config from 'config';
import uploadFavicon from '../utils/uploadFavicon';
import path from 'path';
import os from 'os';
import fs from 'fs';
import express from 'express';

const router = express.Router();

router.get('/favicon', (req, res) => {
  const faviconURL: string = config.get('faviconURL');

  uploadFavicon(faviconURL).then((file) => {
    const filename = faviconURL.substring(faviconURL.lastIndexOf('/')+1);
    const filePath = path.join(os.tmpdir(), filename);

    fs.writeFileSync(filePath, file);
    res.sendFile(filePath);
  });
} );

export default router;
