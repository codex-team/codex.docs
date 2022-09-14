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
    /**
     * Get search string
     */
    const searchString = req.query.text as string;

    /**
     * Get search results
     */
    const searchResponse = await Search.query(searchString);

    /**
     * Compose response
     */
    const compactedPages = searchResponse.pages.map(page => {
      return {
        /** Page id */
        _id: page._id,

        /** Page title */
        title: page.title,

        /** Page uri */
        uri: page.uri,

        /** Section heading name for the found fragment */
        section: page.section,

        /** Section's anchor */
        anchor: page.anchor,

        /** Page fragment with searched items */
        shortBody: page.shortBody,
      };
    });

    res.json({
      success: true,
      result: {
        /** Found pages */
        pages: compactedPages,

        /** Typing suggestions */
        suggestions: searchResponse.suggestions,
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
