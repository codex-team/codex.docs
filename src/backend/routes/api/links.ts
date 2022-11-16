import express, { Request, Response } from 'express';
import ogs from 'open-graph-scraper';

const router = express.Router();

interface ResponseData {
  success: number;
  meta?: {
    title: string | undefined;
    description: string | undefined;
    siteName: string | undefined;
    image: { url: string | undefined }
  }
}

/**
 * Accept file url to fetch
 */
router.get('/fetchUrl', async (req: Request, res: Response) => {
  const response: ResponseData = {
    success: 0,
  };

  if (!req.query.url) {
    res.status(400).json(response);

    return;
  }

  if (typeof req.query.url !== 'string') {
    return;
  }

  try {
    const linkData = (await ogs({ url: req.query.url })).result;

    if (!linkData.success) {
      return;
    }

    response.success = 1;
    response.meta = {
      title: linkData.ogTitle,
      description: linkData.ogDescription,
      siteName: linkData.ogSiteName,
      image: {
        url: undefined,
      },
    };

    const image = linkData.ogImage;

    if (image) {
      if (Array.isArray(image)) {
        response.meta.image = { url: image[0].url };
      } else {
        response.meta.image = { url: image.url };
      }
    }

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(response);
  }
});

export default router;
