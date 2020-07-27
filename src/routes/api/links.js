const express = require('express');
const router = express.Router();
const ogs = require('open-graph-scraper');

/**
 * Accept file url to fetch
 */
router.get('/fetchUrl', async (req, res) => {
  const response = {
    success: 0
  };

  if (!req.query.url) {
    res.status(400).json(response);
    return;
  }

  try {
    const linkData = (await ogs({ url: req.query.url })).result;

    response.success = 1;
    response.meta = {
      title: linkData.ogTitle,
      description: linkData.ogDescription,
      site_name: linkData.ogSiteName,
      image: {
        url: linkData.ogImage.url
      }
    };

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(response);
  }
});

module.exports = router;
