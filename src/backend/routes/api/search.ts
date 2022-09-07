import express, { Request, Response } from 'express';
import Search from '../../controllers/search.js';

const router = express.Router();

/**
 * GET /search/:searchString
 *
 * Search given words in all documents
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const searchString = req.query.text as string;

    /** Start measuring search time */
    // const startTime = performance.now();

    // const search = new Search();
    //
    // const searchResponse = await search.query(searchString);

    const searchResponse = await Search.query(searchString);

    /** End measuring search time */
    // const endTime = performance.now();

    /** Show search time */
    // const searchItem = (endTime - startTime).toFixed(6);
    // console.log(`🔎 "${searchString}" ⏱  ${searchItem} ms`);

    const compactedPages = searchResponse.pages.map(page => {
      return {
        _id: page._id,
        title: page.title,
        uri: page.uri,
        section: page.section,
        anchor: page.anchor,
        shortBody: page.shortBody,
      };
    });

    res.json({
      success: true,
      result: {
        suggestions: searchResponse.suggestions,
        pages: compactedPages,
        // time: searchItem,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: (err as Error).message,
    });
  }
});

export default router;
