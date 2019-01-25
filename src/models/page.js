const {pages: pagesDb} = require('../utils/database/index');
const translateString = require('../utils/translation');

/**
 * @typedef {Object} PageData
 * @property {string} _id - page id
 * @property {string} title - page title
 * @property {string} uri - page uri
 * @property {*} body - page body
 * @property {string} parent - id of parent page
 */

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
  /**
   * Find and return model of page with given id
   * @param {string} _id - page id
   * @returns {Promise<Page>}
   */
  static async get(_id) {
    const data = await pagesDb.findOne({_id});

    return new Page(data);
  }

  /**
   * Find and return model of page with given uri
   * @param {string} uri - page uri
   * @returns {Promise<Page>}
   */
  static async getByUri(uri) {
    const data = await pagesDb.findOne({uri});

    return new Page(data);
  }

  /**
   * Find all pages which match passed query object
   *
   * @param {Object} query
   * @returns {Promise<Page[]>}
   */
  static async getAll(query = {}) {
    const docs = await pagesDb.find(query);

    return Promise.all(docs.map(doc => new Page(doc)));
  }

  /**
   * @constructor
   *
   * @param {PageData} data
   */
  constructor(data = {}) {
    if (data === null) {
      data = {};
    }

    if (data._id) {
      this._id = data._id;
    }

    this.data = data;
  }

  /**
   * Set PageData object fields to internal model fields
   *
   * @param {PageData} pageData
   */
  set data(pageData) {
    const {body, parent, uri} = pageData;

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
  get data() {
    return {
      _id: this._id,
      title: this.title,
      uri: this.uri,
      body: this.body,
      parent: this._parent
    };
  }

  /**
   * Extract first header from editor data
   * @return {string}
   */
  extractTitleFromBody() {
    const headerBlock = this.body ? this.body.blocks.find(block => block.type === 'header') : '';

    return headerBlock ? headerBlock.data.text : '';
  }

  /**
   * Transform title for uri
   * @return {string}
   */
  transformTitleToUri() {
    return translateString(this.title
      .replace(/&nbsp;/g, ' ')
      .replace(/[^a-zA-Z0-9А-Яа-яЁё ]/g, ' ')
      .replace(/  +/g, ' ')
      .trim()
      .toLowerCase()
      .split(' ')
      .join('-'));
  }

  /**
   * Link given page as parent
   *
   * @param {Page} parentPage
   */
  set parent(parentPage) {
    this._parent = parentPage._id;
  }

  /**
   * Return parent page model
   *
   * @returns {Promise<Page>}
   */
  get parent() {
    return pagesDb.findOne({_id: this._parent})
      .then(data => new Page(data));
  }

  /**
   * Return child pages models
   *
   * @returns {Promise<Page[]>}
   */
  get children() {
    return pagesDb.find({parent: this._id})
      .then(data => data.map(page => new Page(page)));
  }

  /**
   * Save or update page data in the database
   *
   * @returns {Promise<Page>}
   */
  async save() {
    this.uri = await this.composeUri(this.uri);

    if (!this._id) {
      const insertedRow = await pagesDb.insert(this.data);

      this._id = insertedRow._id;
    } else {
      await pagesDb.update({_id: this._id}, this.data);
    }

    return this;
  }

  /**
   * Remove page data from the database
   *
   * @returns {Promise<Page>}
   */
  async destroy() {
    await pagesDb.remove({_id: this._id});

    delete this._id;

    return this;
  }

  /**
   * Find and return available uri
   *
   * @returns {Promise<string>}
   */
  async composeUri(uri) {
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
   * Return readable page data
   *
   * @returns {PageData}
   */
  toJSON() {
    return this.data;
  }
}

module.exports = Page;
