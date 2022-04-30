import Page, { PageData } from '../models/page';
import Alias from '../models/alias';
import PagesOrder from './pagesOrder';
import PageOrder from '../models/pageOrder';

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
     * If there is no root nad child page order, then it returns empty array
     */
    if (!rootPageOrder || (!rootPageOrder && childPageOrder.length <= 0)) {
      return [];
    }

    const pages = (await this.getAll()).reduce((map, _page) => {
      map.set(_page._id, _page);

      return map;
    }, new Map);
    const rootPagesId = rootPageOrder.order;

    /**
     * It groups root pages and 1 level pages by its parent
     */
    rootPagesId.reduce((prev, curr, idx) => {
      const childPages = childPageOrder.filter((child, _idx) => {
        if (child.page === curr) {
          childPageOrder.splice(_idx, 1);

          return child;
        }
      });
      const hasChildPage = childPages.length > 0;

      if (hasChildPage) {
        prev[curr] = [];
        prev[curr].push(curr);
        prev[curr].push(...childPages[0].order);
      } else {
        prev[curr] = [];
        prev[curr].push(curr);
      }

      if (idx === rootPagesId.length - 1 && childPageOrder.length > 0) {
        orphanPageOrder.push(...childPageOrder);
      }

      return prev;
    }, orderGroupedByParent);

    /**
     * It groups remained ungrouped pages by its parent
     */
    while (orphanPageOrder.length > 0) {
      orphanPageOrder.forEach((orphanOrder, idx) => {
        Object.entries(orderGroupedByParent).forEach(([key, value]) => {
          if (orphanOrder.page && orphanOrder.order && value.includes(orphanOrder.page)) {
            orderGroupedByParent[key].splice(value.indexOf(orphanOrder.page) + 1, 0, ...orphanOrder.order);
            orphanPageOrder.splice(idx, 1);
          }
        });
      });
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

    return page.destroy();
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
