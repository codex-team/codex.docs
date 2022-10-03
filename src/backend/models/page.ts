import urlify from '../utils/urlify.js';
import database, {isEqualIds} from '../database/index.js';
import { EntityId } from '../database/types.js';

const pagesDb = database['pages'];

/**
 * @typedef {object} PageData
 * @property {string} _id - page id
 * @property {string} title - page title
 * @property {string} uri - page uri
 * @property {*} body - page body
 * @property {string} parent - id of parent page
 */
export interface PageData {
  _id?: EntityId;
  title?: string;
  uri?: string;
  body?: any;
  parent?: EntityId;
}

/**
 * @class Page
 * @class Page model
 * @property {string} _id - page id
 * @property {string} title - page title
 * @property {string} uri - page uri
 * @property {*} body - page body
 * @property {string} _parent - id of parent page
 */
class Page {
  public _id?: EntityId;
  public body?: any;
  public title?: string;
  public uri?: string;
  public _parent?: EntityId;

  /**
   * @class
   * @param {PageData} data - page's data
   */
  constructor(data: PageData = {}) {
    if (data === null) {
      data = {};
    }

    if (data._id) {
      this._id = data._id;
    }

    this.data = data;
  }

  /**
   * Find and return model of page with given id
   *
   * @param {string} _id - page id
   * @returns {Promise<Page>}
   */
  public static async get(_id: EntityId): Promise<Page> {
    const data = await pagesDb.findOne({ _id });

    return new Page(data);
  }

  /**
   * Find and return model of page with given uri
   *
   * @param {string} uri - page uri
   * @returns {Promise<Page>}
   */
  public static async getByUri(uri: string): Promise<Page> {
    const data = await pagesDb.findOne({ uri });

    return new Page(data);
  }

  /**
   * Find all pages which match passed query object
   *
   * @param {object} query - input query
   * @returns {Promise<Page[]>}
   */
  public static async getAll(query: Record<string, unknown> = {}): Promise<Page[]> {
    const docs = await pagesDb.find(query);

    return docs.map(doc => new Page(doc));
  }

  /**
   * Set PageData object fields to internal model fields
   *
   * @param {PageData} pageData - page's data
   */
  public set data(pageData: PageData) {
    const { body, parent, uri } = pageData;

    this.body = body || this.body;
    this.title = this.extractTitleFromBody();
    this.uri = uri || '';
    this._parent = parent || this._parent || '0' as EntityId;
  }

  /**
   * Return PageData object
   *
   * @returns {PageData}
   */
  public get data(): PageData {
    return {
      _id: this._id,
      title: this.title,
      uri: this.uri,
      body: this.body,
      parent: this._parent,
    };
  }

  /**
   * Link given page as parent
   *
   * @param {Page} parentPage - the page to be set as parent
   */
  public set parent(parentPage: Page) {
    this._parent = parentPage._id;
  }

  /**
   * Return parent page model
   *
   * @returns {Promise<Page>}
   */
  public async getParent(): Promise<Page> {
    const data = await pagesDb.findOne({ _id: this._parent });

    return new Page(data);
  }

  /**
   * Return child pages models
   *
   * @returns {Promise<Page[]>}
   */
  public get children(): Promise<Page[]> {
    return pagesDb.find({ parent: this._id })
      .then(data => {
        return data.map(page => new Page(page));
      });
  }

  /**
   * Save or update page data in the database
   *
   * @returns {Promise<Page>}
   */
  public async save(): Promise<Page> {
    if (this.uri !== undefined) {
      this.uri = await this.composeUri(this.uri);
    }

    if (!this._id) {
      const insertedRow = await pagesDb.insert(this.data) as { _id: EntityId };

      this._id = insertedRow._id;
    } else {
      await pagesDb.update({ _id: this._id }, this.data);
    }

    return this;
  }

  /**
   * Remove page data from the database
   *
   * @returns {Promise<Page>}
   */
  public async destroy(): Promise<Page> {
    await pagesDb.remove({ _id: this._id });

    delete this._id;

    return this;
  }

  /**
   * Return readable page data
   *
   * @returns {PageData}
   */
  public toJSON(): PageData {
    return this.data;
  }

  /**
   * Find and return available uri
   *
   * @returns {Promise<string>}
   * @param uri - input uri to be composed
   */
  private async composeUri(uri: string): Promise<string> {
    let pageWithSameUriCount = 0;

    if (!this._id) {
      uri = this.transformTitleToUri();
    }

    if (uri) {
      let pageWithSameUri = await Page.getByUri(uri);

      while (pageWithSameUri._id && !isEqualIds(pageWithSameUri._id, this._id)) {
        pageWithSameUriCount++;
        pageWithSameUri = await Page.getByUri(uri + `-${pageWithSameUriCount}`);
      }
    }

    return pageWithSameUriCount ? uri + `-${pageWithSameUriCount}` : uri;
  }

  /**
   * Extract first header from editor data
   *
   * @returns {string}
   */
  private extractTitleFromBody(): string {
    const headerBlock = this.body ? this.body.blocks.find((block: Record<string, unknown>) => block.type === 'header') : '';

    return headerBlock ? headerBlock.data.text : '';
  }

  /**
   * Transform title for uri
   *
   * @returns {string}
   */
  private transformTitleToUri(): string {
    if (this.title === undefined) {
      return '';
    }

    return urlify(this.title);
  }
}

export default Page;
