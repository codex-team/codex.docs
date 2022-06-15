import config from 'config';
import uploadFavicon from '../utils/uploadFavicon';
import express from 'express';

const router = express.Router();

// Get url to upload favicon from config
const faviconURL: string = config.get('faviconURL');

// Favicon path
let filePath: string;

// Upload favicon by url
uploadFavicon(faviconURL).then((res) => {
  filePath = res;
})
  .catch( (err) => {
    console.log(err);
  });

/**
 * Get favicon
 */
router.get('/favicon', (req, res) => {
  res.sendFile(filePath);
} );

export default router;
