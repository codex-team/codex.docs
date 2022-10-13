import Page, { PageData } from '../models/page.js';
import Alias from '../models/alias.js';
import PagesOrder from './pagesOrder.js';
import PageOrder from '../models/pageOrder.js';
import HttpException from '../exceptions/httpException.js';
import PagesFlatArray from '../models/pagesFlatArray.js';

type PageDataFields = keyof PageData;

/**
 * @class Pages
 * @classdesc Pages controller
 */
class Pages {
  /**
   * Fields required for page model creation
   *
   * @returns {['title', 'body']}
   */
  public static get REQUIRED_FIELDS(): Array<PageDataFields> {
    return [ 'body' ];
  }

  /**
   * Find and return page model with passed id
   *
   * @param {string} id - page id
   * @returns {Promise<Page>}
   */
  public static async get(id: string): Promise<Page> {
    const page = await Page.get(id);

    if (!page._id) {
      throw new Error('Page with given id does not exist');
    }

    return page;
  }

  /**
   * Return all pages
   *
   * @returns {Promise<Page[]>}
   */
  public static async getAll(): Promise<Page[]> {
    return Page.getAll();
  }

  /**
   * Return all pages without children of passed page
   *
   * @param {string} parent - id of current page
   * @returns {Promise<Page[]>}
   */
  public static async getAllExceptChildren(parent: string): Promise<Page[]> {
    const pagesAvailable = this.removeChildren(await Pages.getAll(), parent);

    const nullFilteredPages: Page[] = [];

    pagesAvailable.forEach(async item => {
      if (item instanceof Page) {
        nullFilteredPages.push(item);
      }
    });

    return nullFilteredPages;
  }

  /**
   * Group all pages by their parents
   * If the pageId is passed, it excludes passed page from result pages
   *
   * @param {string} pageId - pageId to exclude from result pages
   * @returns {Page[]}
   */
  public static async groupByParent(pageId = ''): Promise<Page[]> {
    const result: Page[] = [];
    const orderGroupedByParent: Record<string, string[]> = {};
    const rootPageOrder = await PagesOrder.getRootPageOrder();
    const childPageOrder = await PagesOrder.getChildPageOrder();
    const orphanPageOrder: PageOrder[] = [];

    /**
     * If there is no root and child page order, then it returns an empty array
     */
    if (!rootPageOrder || (!rootPageOrder && childPageOrder.length <= 0)) {
      return [];
    }

    const pages = (await this.getAll()).reduce((map, _page) => {
      map.set(_page._id, _page);

      return map;
    }, new Map);
    const idsOfRootPages = rootPageOrder.order;

    /**
     * It groups root pages and 1 level pages by its parent
     */
    idsOfRootPages.reduce((prev, curr, idx) => {
      const childPages:PageOrder[] = [];

      childPageOrder.forEach((pageOrder, _idx) => {
        if (pageOrder.page === curr) {
          childPages.push(pageOrder);
          childPageOrder.splice(_idx, 1);
        }
      });

      const hasChildPage = childPages.length > 0;

      prev[curr] = [];
      prev[curr].push(curr);

      /**
       * It attaches 1 level page id to its parent page id
       */
      if (hasChildPage) {
        prev[curr].push(...childPages[0].order);
      }

      /**
       * If non-attached childPages which is not 1 level page still remains,
       * It is stored as an orphan page so that it can be processed in the next statements
       */
      if (idx === idsOfRootPages.length - 1 && childPageOrder.length > 0) {
        orphanPageOrder.push(...childPageOrder);
      }

      return prev;
    }, orderGroupedByParent);

    let count = 0;

    /**
     * It groups remained ungrouped pages by its parent
     */
    while (orphanPageOrder.length > 0) {
      if (count >= 1000) {
        throw new HttpException(500, `Page cannot be processed`);
      }

      orphanPageOrder.forEach((orphanOrder, idx) => {
        // It loops each of grouped orders formatted as [root page id(1): corresponding child pages id(2)]
        Object.entries(orderGroupedByParent).forEach(([parentPageId, value]) => {
          // If (2) contains orphanOrder's parent id(page)
          if (orphanOrder.page && orphanOrder.order && value.includes(orphanOrder.page)) {
            // Append orphanOrder's id(order) into its parent id
            orderGroupedByParent[parentPageId].splice(value.indexOf(orphanOrder.page) + 1, 0, ...orphanOrder.order);
            // Finally, remove orphanOrder from orphanPageOrder
            orphanPageOrder.splice(idx, 1);
          }
        });
      });

      count += 1;
    }

    /**
     * It converts grouped pages(object) to array
     */
    Object.values(orderGroupedByParent).flatMap(arr => [ ...arr ])
      .forEach(arr => {
        result.push(pages.get(arr));
      });

    /**
     * If the pageId passed, it excludes itself from result pages
     * Otherwise just returns result itself
     */
    if (pageId) {
      return this.removeChildren(result, pageId).reduce((prev, curr) => {
        if (curr instanceof Page) {
          prev.push(curr);
        }

        return prev;
      }, Array<Page>());
    } else {
      return result;
    }
  }

  /**
   * Set all children elements to null
   *
   * @param {Array<Page|null>} [pagesAvailable] - Array of all pages
   * @param {string} parent - id of parent page
   * @returns {Array<?Page>}
   */
  public static removeChildren(pagesAvailable: Array<Page | null>, parent: string | undefined): Array<Page | null> {
    pagesAvailable.forEach(async (item, index) => {
      if (item === null || item._parent !== parent) {
        return;
      }
      pagesAvailable[index] = null;
      pagesAvailable = Pages.removeChildren(pagesAvailable, item._id);
    });
    PagesFlatArray.regenerate();

    return pagesAvailable;
  }

  /**
   * Create new page model and save it in the database
   *
   * @param {PageData} data - info about page
   * @returns {Promise<Page>}
   */
  public static async insert(data: PageData): Promise<Page> {
    try {
      Pages.validate(data);

      const page = new Page(data);

      const insertedPage = await page.save();

      if (insertedPage.uri) {
        const alias = new Alias({
          id: insertedPage._id,
          type: Alias.types.PAGE,
        }, insertedPage.uri);

        alias.save();
      }
      await PagesFlatArray.regenerate();

      return insertedPage;
    } catch (e) {
      throw new Error('validationError');
    }
  }

  /**
   * Update page with given id in the database
   *
   * @param {string} id - page id
   * @param {PageData} data - info about page
   * @returns {Promise<Page>}
   */
  public static async update(id: string, data: PageData): Promise<Page> {
    const page = await Page.get(id);
    const previousUri = page.uri;

    if (!page._id) {
      throw new Error('Page with given id does not exist');
    }

    if (data.uri && !data.uri.match(/^[a-z0-9'-]+$/i)) {
      throw new Error('Uri has unexpected characters');
    }

    page.data = data;
    const updatedPage = await page.save();

    if (updatedPage.uri !== previousUri) {
      if (updatedPage.uri) {
        const alias = new Alias({
          id: updatedPage._id,
          type: Alias.types.PAGE,
        }, updatedPage.uri);

        alias.save();
      }

      if (previousUri) {
        Alias.markAsDeprecated(previousUri);
      }
    }
    await PagesFlatArray.regenerate();

    return updatedPage;
  }

  /**
   * Remove page with given id from the database
   *
   * @param {string} id - page id
   * @returns {Promise<Page>}
   */
  public static async remove(id: string): Promise<Page> {
    const page = await Page.get(id);

    if (!page._id) {
      throw new Error('Page with given id does not exist');
    }

    if (page.uri) {
      const alias = await Alias.get(page.uri);

      await alias.destroy();
    }
    const removedPage = page.destroy();

    await PagesFlatArray.regenerate();

    return removedPage;
  }

  /**
   * Check PageData object for required fields
   *
   * @param {PageData} data - info about page
   * @throws {Error} - validation error
   */
  private static validate(data: PageData): void {
    const allRequiredFields = Pages.REQUIRED_FIELDS.every(field => typeof data[field] !== 'undefined');

    if (!allRequiredFields) {
      throw new Error('Some of required fields is missed');
    }

    const hasBlocks = data.body && data.body.blocks && Array.isArray(data.body.blocks) && data.body.blocks.length > 0;

    if (!hasBlocks) {
      throw new Error('Page body is invalid');
    }

    const hasHeaderAsFirstBlock = data.body.blocks[0].type === 'header';

    if (!hasHeaderAsFirstBlock) {
      throw new Error('First page Block must be a Header');
    }

    const headerIsNotEmpty = data.body.blocks[0].data.text.replace('<br>', '').trim() !== '';

    if (!headerIsNotEmpty) {
      throw new Error('Please, fill page Header');
    }
  }
}

export default Pages;
