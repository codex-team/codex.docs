import Page from '../models/page';
import Pages from '../controllers/pages';

type SearchResponse = {
  completions: string[];

  pages: Page[];
}

class Search {
  /**
   * Prepare words database
   */
  public async index() {
    /**
     * Prepare pages content for the search
     * @todo - it should be done in the background
     */
    const pages = await Pages.getAll();
    const pagesWords = pages.map(page => {
      const pageWords: string[] = [];

      page.body.blocks.forEach((block: any) => {
        let blockContent = '';

        const validBlocks = ['header', 'paragraph'];
        if (!validBlocks.includes(block.type)) {
          return;
        }

        switch (block.type) {
          case 'header':
            blockContent = block.data.text;
            break;

          case 'paragraph':
            blockContent = block.data.text
            break;
        }

        const blockWords: string[] = blockContent
          // @todo get text from inline code elements and remove html tags

          // left only letters and numbers
          .replace(/[^a-z0-9]/gi, ' ')

          // lowercase all words
          .toLowerCase()

          // remove multiple spaces
          .replace(/\s+/g, ' ')

          // split to words by spaces
          .split(' ');

        pageWords.push(...blockWords);
      });

      const uniqueWords = [...new Set(pageWords)].sort();

      return {
        id: page._id,
        words: uniqueWords
      };
    });

    return pagesWords;
  }

  public async query(searchString: string): Promise<SearchResponse> {
    const pages = await Pages.getAll();
    const pagesWords = await this.index();

    /**
     * Search itself
     */
    const searchWords = searchString.toLowerCase().split(' ');
    const goodPages = pagesWords.map(({ id, words}) => {
      const foundWords = searchWords.filter(
        word => {
          return words.filter(
            testWord => {
              return testWord.indexOf(word) === 0
            }
          ).length > 0;
        }
      );

      const successRatio = foundWords.length / searchWords.length * 100;

      return {
        id,
        successRatio
      }
    });

    const foundPages = goodPages
      .filter(({ successRatio }) => successRatio > 50)
      .sort((a, b) => b.successRatio - a.successRatio)
      .slice(0, 10);


    // --------- START test ---------

    const uniqWords = [...new Set(pagesWords.flatMap(page => page.words))].sort();

    uniqWords.forEach(word => {
      console.log(word);
    })

    // --------- END test ---------



    return {
      completions: uniqWords.filter(word => word.indexOf(searchWords.slice(-1)[0]) === 0),
      pages: pages.filter(page => foundPages.some(({ id }) => id === page._id))
    }
  }

  private async search(searchString: string) {
    const pages = await this.query(searchString);

    return pages;
  }
}

export default Search;
