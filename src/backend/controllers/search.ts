import Page from '../models/page';
import Pages from '../controllers/pages';

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

        const validBlocks = ['header', 'paragraph', 'list'];
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

          case 'list':
            blockContent = block.data.items.join(' ');
            break;

          default:
            return;
        }

        const blockWords: string[] = blockContent
          .replace(/<[^>]*>?/gm, '')

          // lowercase all words
          .toLowerCase()

          // left only letters (+cyrillic) and numbers
          .replace(/[^a-zа-я0-9]/gi, ' ')

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

  public async query(searchString: string) {
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
      .filter(({ successRatio }) => successRatio > 75)
      .sort((a, b) => b.successRatio - a.successRatio)
      .slice(0, 10);

    const returnPages = pages.filter(page => foundPages.some(({ id }) => id === page._id))
      .map(page => {
        let shortBody = '';
        let flag = false;
        let section = '';
        let ratio = 0;

        page.body.blocks.forEach((block: any) => {
          if (flag) return;

          let blockContent = '';

          switch (block.type) {
            case 'header':
              blockContent = block.data.text;
              ratio = 1;
              section = blockContent;
              break;

            case 'paragraph':
              blockContent = block.data.text
              ratio = 0.5;
              break;

            case 'list':
              blockContent = block.data.items.join(' ');
              ratio = 0.5;
              break;

            default:
              return;
          }

          blockContent = blockContent
            .replace(/<[^>]*>?/gm, '');
            // .toLowerCase();

          searchWords.forEach(word => {
            // blockContent = blockContent.replace(word, `<span class="search-word">${word}</span>`);
            if (flag) return;

            if (blockContent.toLowerCase().indexOf(word) !== -1) {

              shortBody = this.highlightSubstring(blockContent, word);
              flag = true;
            }
          })

        });

        return {
          ...page,
          shortBody,
          anchor: section.replace(/\s+/g, '-').toLowerCase(),
          section,
        };
      });




    // --------- START test ---------
    //
    const uniqWords = [...new Set(pagesWords.flatMap(page => page.words))].sort();
    //
    // uniqWords.forEach(word => {
    //   console.log(word);
    // })

    // --------- END test ---------



    return {
      suggestions: uniqWords.filter(word => word.indexOf(searchWords.slice(-1)[0]) === 0),
      pages: returnPages
    }
  }

  private async search(searchString: string) {
    const pages = await this.query(searchString);

    return pages;
  }

  private highlightSubstring(text: string, word: string) {
    const wordRegExp = new RegExp(word, "ig");

    return text.replace(wordRegExp, '<span class="search-word">$&</span>');
  }
}

export default Search;
