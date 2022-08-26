import PageData from '../models/page.js';
import Pages from '../controllers/pages.js';
import urlify from '../utils/urlify.js';

class Search {
  private words: { [key: string]: {[key: string]: number} } = Object.create(null);
  private pages: PageData[] = [];

  public async init() {
    this.pages = await this.getPages();

    /**
     * Process all pages
     */
    for await (const page of this.pages) {

      // if (page._id && !this.pages[page._id]) {
      //   this.pages[page._id] = [];
      // }

      /**
       * Read content blocks from page
       */
      for await (const block of page.body.blocks) {
        const blockRatio = this.getBlockRatio(block);
        const blockContent = this.getCleanTextFromBlock(block);
        const blockWords: string[] = this.splitTextToWords(blockContent);

        // if (page._id) {
        //   this.pages[page._id].push(...blockWords);
        // }

        /**
         * Process list of words in a block
         */
        for await (const word of blockWords) {
          if (!this.words[word]) {
            this.words[word] = Object.create(null);
          }

          if (page._id) {
            if (!this.words[word][page._id]) {
              this.words[word][page._id] = 0;
            }

            /**
             * Add page id to the list of pages with this word
             */
            this.words[word][page._id] += blockRatio;
          }
        }
      }
    }
  }

  public async query(searchString: string) {
    try {
      await this.init();
    } catch (error) {
      console.log(error);
      throw error;
    }

    const searchWords = searchString
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .split(' ');

    const goodPages = (await this.getPagesByWords(searchWords))
      .slice(0, 10);

    const returnPages: {[key: string]: string|number, ratio: number}[] = [];

    goodPages.forEach(({ pageId, ratio }) => {
      const page = this.pages.filter(page => page._id === pageId).pop();

      if (!page) {
        return;
      }

      let section = '';

      page.body.blocks.forEach((block: any) => {
        let koef = 0;

        let blockContent = this.getCleanTextFromBlock(block);

        let shortBody = blockContent;

        if (block.type === 'header') {
          section = blockContent;
        }

        searchWords.forEach(word => {
          if (blockContent.toLowerCase().indexOf(word) !== -1) {
            koef += 1;
          }
        })

        shortBody = this.highlightSubstring(shortBody, searchWords);

        if (koef > 0) {
          returnPages.push({
            ...page,
            shortBody,
            anchor: urlify(section),
            section,
            ratio: ratio * koef,
          })
        }
      });
    });

    // // --------- START test ---------
    // //
    // const uniqWords = [...new Set(pagesWords.flatMap(page => page.words))].sort();
    // //
    // // uniqWords.forEach(word => {
    // //   console.log(word);
    // // })
    //
    // // --------- END test ---------

    // console.log('RESULT')
    // returnPages.forEach(page => {
    //   console.log(page);
    // });
    //
    // return {
    //   suggestions: uniqWords.filter(word => word.indexOf(searchWords.slice(-1)[0]) === 0),
    //   pages: returnPages
    // }


    return {
      suggestions: [],
      pages: returnPages
        .sort((a, b) => b.ratio - a.ratio)
        .slice(0, 15)
    }
  }

  private async getPages() {
    return await Pages.getAll();
  }

  private async getPagesByWords(words: string[]) {
    const pagesList: {[key: string]: number} = {};

    Object.keys(this.words)
      .filter(word => {
        return !!words.filter(searchWord => word.indexOf(searchWord) !== -1).length
      })
      .forEach(word => {
        Object.keys(this.words[word])
          .forEach(pageId => {
            if (!pagesList[pageId]) {
              pagesList[pageId] = 0;
            }

            pagesList[pageId] += this.words[word][pageId]
          })
      })

    const sortedPagesList = Object.keys(pagesList)
      .map(pageId => {
        return {
          pageId,
          ratio: pagesList[pageId]
        }
      })
      .sort((a, b) => b.ratio - a.ratio);

    return sortedPagesList;
  }

  private getUnique(elements: string[]) {
    return [...new Set(elements)].sort();
  }

  private getBlockRatio(block: any) {
    switch (block.type) {
      case 'header':
        return 6;
      case 'paragraph':
        return 2;
      case 'list':
        return 1;
      default:
        return 0;
    }
  }

  private getCleanTextFromBlock(block: any): string {
    let blockContent = '';

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
        return blockContent;
    }

    blockContent = this.removeHTMLTags(blockContent);
    blockContent = this.removeHTMLSpecialCharacters(blockContent);

    return blockContent;
  }

  private removeHTMLTags(text: string) {
    return text.replace(/<[^>]*>?/gm, '');
  }

  private removeHTMLSpecialCharacters(text: string) {
    return text.replace(/&[^;]*;?/gm, '');
  }

  private splitTextToWords(text: string): string[] {
    return text
      // lowercase all words
      .toLowerCase()

      // remove punctuation
      .replace(/[.,;:]/gi, '')

      // left only letters (+cyrillic) and numbers
      .replace(/[^a-zа-я0-9]/gi, ' ')

      // remove multiple spaces
      .replace(/\s+/g, ' ')

      // split to words by spaces
      .split(' ')

      // ignore words shorter than 3 chars
      .filter(word => word.length >= 3);
  }

  /**
   * Highlight substring in string with a span wrapper
   */
  private highlightSubstring(text: string, words: string|string[]) {
    if (typeof words === 'string') {
      words = [words];
    }

    const wordRegExp = new RegExp(words.join('|'), "ig");
    const CLASS_STYLE = 'search-word';

    return text.replace(wordRegExp, `<span class="${CLASS_STYLE}">$&</span>`);
  }
}

export default Search;
