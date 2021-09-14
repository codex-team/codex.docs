import Model, { PageData } from '../models/page';
import Page from '../models/page';
import Alias from '../models/alias';

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
  public static get REQUIRED_FIELDS(): Array<string> {
    return [ 'body' ];
  }

  /**
   * Find and return page model with passed id
   *
   * @param {string} id - page id
   * @returns {Promise<Page>}
   */
  public static async get(id: string): Promise<Page> {
    const page = await Model.get(id);

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
    return Model.getAll();
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
   * Set all children elements to null
   *
   * @param {Array<Page|null>} [pagesAvailable] - Array of all pages
   * @param {string} parent - id of parent page
   * @returns {Array<?Page>}
   */
  public static removeChildren(pagesAvailable: Array<Page|null>, parent: string | undefined): Array<Page | null> {
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

      const page = new Model(data);

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
    const page = await Model.get(id);
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

      Alias.markAsDeprecated(previousUri);
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
    const page = await Model.get(id);

    if (!page._id) {
      throw new Error('Page with given id does not exist');
    }

    const alias = await Alias.get(page.uri);

    await alias.destroy();

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
