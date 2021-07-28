import urlify from '../utils/urlify';
import database from '../utils/database/index';

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
  _id?: string;
  title?: string;
  uri?: string;
  body?: any;
  parent?: string;
  [key: string]: any;
}

/**
 * @class Page
 * @class Page model
 *
 * @property {string} _id - page id
 * @property {string} title - page title
 * @property {string} uri - page uri
 * @property {*} body - page body
 * @property {string} _parent - id of parent page
 */
class Page {
  public _id?: string;
  public body: any;
  public title: any;
  public uri: any;
  public _parent: any;

  /**
   * @class
   *
   * @param {PageData} data
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
  public static async get(_id: string): Promise<Page> {
    const data = await pagesDb.findOne({ _id });

    if (data instanceof Error) {
      return new Page();
    }

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

    if (data instanceof Error) {
      return new Page();
    }

    return new Page(data);
  }

  /**
   * Find all pages which match passed query object
   *
   * @param {object} query
   * @returns {Promise<Page[]>}
   */
  public static async getAll(query: object = {}): Promise<Page[]> {
    const docs = await pagesDb.find(query);

    if (docs instanceof Error) {
      return [];
    }

    return Promise.all(docs.map(doc => new Page(doc)));
  }

  /**
   * Set PageData object fields to internal model fields
   *
   * @param {PageData} pageData
   */
  public set data(pageData: PageData) {
    const { body, parent, uri } = pageData;

    this.body = body || this.body;
    this.title = this.extractTitleFromBody();
    this.uri = uri || '';
    this._parent = parent || this._parent || '0';
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
   * @param {Page} parentPage
   */
  public set parent(parentPage: Page) {
    this._parent = parentPage._id;
  }

  /**
   * Return parent page model
   *
   * @returns {Promise<Page>}
   */
  public async getParent(): Promise<Page|null> {
    const data = await pagesDb.findOne({ _id: this._parent });

    if (data instanceof Error) {
      return null;
    }

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
        if (data instanceof Error) {
          return [];
        }

        return data.map(page => new Page(page));
      });
  }

  /**
   * Save or update page data in the database
   *
   * @returns {Promise<Page>}
   */
  public async save(): Promise<Page> {
    this.uri = await this.composeUri(this.uri);

    if (!this._id) {
      const insertedRow = await pagesDb.insert(this.data) as { _id: string };

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
   * @param uri
   */
  private async composeUri(uri: string): Promise<string> {
    let pageWithSameUriCount = 0;

    if (!this._id) {
      uri = this.transformTitleToUri();
    }

    if (uri) {
      let pageWithSameUri = await Page.getByUri(uri);

      while (pageWithSameUri._id && pageWithSameUri._id !== this._id) {
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
    const headerBlock = this.body ? this.body.blocks.find((block: any) => block.type === 'header') : '';

    return headerBlock ? headerBlock.data.text : '';
  }

  /**
   * Transform title for uri
   *
   * @returns {string}
   */
  private transformTitleToUri(): string {
    return urlify(this.title);
  }
}

export default Page;
