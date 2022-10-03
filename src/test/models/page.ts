import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import config from 'config';
import Page from '../../backend/models/page.js';
import translateString from '../../backend/utils/translation.js';
import database from '../../backend/database/index.js';
import { fileURLToPath } from 'url';

/**
 * The __dirname CommonJS variables are not available in ES modules.
 * https://nodejs.org/api/esm.html#no-__filename-or-__dirname
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pages = database['pages'];

describe('Page model', () => {
  const transformToUri = (text: string): string => {
    return translateString(text
      .replace(/&nbsp;/g, ' ')
      .replace(/[^a-zA-Z0-9А-Яа-яЁё ]/g, ' ')
      .replace(/  +/g, ' ')
      .trim()
      .toLowerCase()
      .split(' ')
      .join('-'));
  };

  after(() => {
    const pathToDB = path.resolve(__dirname, '../../../', config.get('database'), './pages.db');

    if (fs.existsSync(pathToDB)) {
      fs.unlinkSync(pathToDB);
    }
  });

  it('Working with empty model', async () => {
    let page = new Page();

    expect(page.data).to.be.a('object');

    let {data} = page;

    expect(data._id).to.be.undefined;
    expect(data.title).to.be.empty;
    expect(data.uri).to.be.empty;
    expect(data.body).to.be.undefined;
    expect(data.parent).to.be.equal('0');

    page = new Page();

    data = page.data;

    expect(data._id).to.be.undefined;
    expect(data.title).to.be.empty;
    expect(data.uri).to.be.empty;
    expect(data.body).to.be.undefined;
    expect(data.parent).to.be.equal('0');

    const initialData = {
      _id: 'page_id',
      body: {
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Page header'
            }
          }
        ]
      }
    };

    page = new Page(initialData);

    const json = page.toJSON();

    data = page.data;

    expect(data._id).to.equal(initialData._id);
    expect(data.title).to.equal(initialData.body.blocks[0].data.text);
    expect(data.uri).to.be.empty;
    expect(data.body).to.deep.equal(initialData.body);
    expect(data.parent).to.be.equal('0');

    expect(json._id).to.equal(initialData._id);
    expect(json.title).to.equal(initialData.body.blocks[0].data.text);
    expect(json.title).to.equal(initialData.body.blocks[0].data.text);
    expect(json.body).to.deep.equal(initialData.body);
    expect(json.parent).to.be.equal('0');

    const update = {
      _id: '12345',
      body: {
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Updated page header'
            }
          }
        ]
      }
    };

    page.data = update;

    data = page.data;

    expect(data._id).to.equal(initialData._id);
    expect(data.title).to.equal(update.body.blocks[0].data.text);
    expect(data.uri).to.be.empty;
    expect(data.body).to.equal(update.body);
    expect(data.parent).to.be.equal('0');
  });

  it('Saving, updating and deleting model in the database', async () => {
    const initialData = {
      body: {
        blocks: [
          {
            type: 'header',
            data: {
              text: 'New page header'
            }
          }
        ]
      }
    };
    const page = new Page(initialData);

    const savedPage = await page.save();

    expect(savedPage._id).not.be.undefined;
    expect(savedPage.title).to.equal(initialData.body.blocks[0].data.text);
    expect(savedPage.uri).to.equal(transformToUri(initialData.body.blocks[0].data.text));
    expect(savedPage.body).to.equal(initialData.body);
    expect(page._id).not.be.undefined;

    const insertedPage = await pages.findOne({_id: page._id});

    expect(insertedPage._id).to.equal(page._id);
    expect(insertedPage.title).to.equal(page.title);
    expect(insertedPage.uri).to.equal(page.uri);
    expect(insertedPage.body).to.deep.equal(page.body);

    const updateData = {
      body: {
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Updated page header'
            }
          }
        ]
      },
      uri: 'updated-uri'
    };

    page.data = updateData;
    await page.save();

    expect(page._id).to.equal(insertedPage._id);

    const updatedPage = await pages.findOne({_id: page._id});

    expect(updatedPage._id).to.equal(savedPage._id);
    expect(updatedPage.title).to.equal(updateData.body.blocks[0].data.text);
    expect(updatedPage.uri).to.equal(updateData.uri);
    expect(updatedPage.body).to.deep.equal(updateData.body);

    await page.destroy();

    expect(page._id).to.be.undefined;

    const removedPage = await pages.findOne({_id: updatedPage._id});

    expect(removedPage).to.be.null;
  });

  it('Handle multiple page creation with the same uri', async () => {
    const initialData = {
      body: {
        blocks: [
          {
            type: 'header',
            data: {
              text: 'New page header'
            }
          }
        ]
      }
    };
    const firstPage = new Page(initialData);
    let firstSavedPage = await firstPage.save();
    const secondPage = new Page(initialData);
    const secondSavedPage = await secondPage.save();

    expect(secondSavedPage.uri).to.equal(transformToUri(initialData.body.blocks[0].data.text) + '-1');

    const newUri = 'new-uri';

    firstPage.data = {...firstPage.data, uri: newUri};
    firstSavedPage = await firstPage.save();

    expect(firstSavedPage.uri).to.equal(newUri);

    const thirdPage = new Page(initialData);
    const thirdSavedPage = await thirdPage.save();

    expect(thirdSavedPage.uri).to.equal(transformToUri(initialData.body.blocks[0].data.text));
  });

  it('Static get method', async () => {
    const initialData = {
      body: {
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Test Page header'
            }
          }
        ]
      }
    };
    const page = new Page(initialData);

    const savedPage = await page.save();

    if (savedPage._id == undefined) {
      await page.destroy();

      return;
    }

    const foundPage = await Page.get(savedPage._id);

    const {data} = foundPage;

    expect(data._id).to.equal(savedPage._id);
    expect(data.title).to.equal(initialData.body.blocks[0].data.text);
    expect(data.uri).to.equal(transformToUri(initialData.body.blocks[0].data.text));
    expect(data.body).to.deep.equal(initialData.body);

    await page.destroy();
  });

  it('Static getAll method', async () => {
    const pagesToSave = [
      new Page({
        body: {
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Page 1 header'
              }
            }
          ]
        }
      }),
      new Page({
        body: {
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Page 2 header'
              }
            }
          ]
        }
      })
    ];

    const savedPages = await Promise.all(pagesToSave.map(page => page.save()));

    const foundPages = await Page.getAll({_id: {$in: savedPages.map(page => page._id)}});

    expect(foundPages.length).to.equal(2);
    foundPages.forEach((page, i) => {
      expect(page.title).to.equal(pagesToSave[i].body.blocks[0].data.text);
      expect(page.uri).to.equal(transformToUri(pagesToSave[i].body.blocks[0].data.text));
      expect(page.body).to.deep.equal(pagesToSave[i].body);
    });
  });

  it('Parent pages', async () => {
    const parent = new Page(
      {
        body: {
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Parent page header'
              }
            }
          ]
        }
      }
    );
    const {_id: parentId} = await parent.save();

    const child = new Page(
      {
        body: {
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Child page header'
              }
            }
          ]
        },
        parent: parentId,
      }
    );

    const {_id: childId} = await child.save();

    const testedParent = await child.getParent();

    expect(testedParent).to.be.not.null;
    if (testedParent) {
      expect(testedParent._id).to.equal(parentId);
      expect(testedParent.title).to.equal(parent.body.blocks[0].data.text);
      expect(testedParent.uri).to.equal(transformToUri(parent.body.blocks[0].data.text));
      expect(testedParent.body).to.deep.equal(parent.body);
    }

    const children = await parent.children;

    expect(children.length).to.equal(1);

    const temp: Page|undefined = children.pop();
    const testedChild: Page = !temp ? new Page({}) : temp;

    expect(testedChild._id).to.equal(childId);
    expect(testedChild.title).to.equal(child.body.blocks[0].data.text);
    expect(testedChild.uri).to.equal(transformToUri(child.body.blocks[0].data.text));
    expect(testedChild.body).to.deep.equal(child.body);
    expect(testedChild._parent).to.equal(child._parent);
    expect(testedChild._parent).to.equal(parent._id);

    parent.destroy();
    child.destroy();
  });

  it('Extracting title from page body', async () => {
    const pageData = {
      body: {
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Page header'
            }
          }
        ]
      }
    };

    const page = new Page(pageData);

    expect(page.title).to.equal(pageData.body.blocks[0].data.text);
  });

  it('test deletion', async () => {
    const pageIndexes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const orders = {
      '0' : ['1', '2', '3'],
      '1' : ['4', '5'],
      '5' : ['6', '7', '8'],
      '3' : ['9'],
    } as { [key: string]: string[] };

    function deleteRecursively(startFrom: string): void {
      const order: string[] = orders[startFrom];

      if (!order) {
        const found = pageIndexes.indexOf(startFrom);

        pageIndexes.splice(found, 1);

        return;
      }

      order.forEach(id => {
        deleteRecursively(id);
      });

      const found = pageIndexes.indexOf(startFrom);
      pageIndexes.splice(found, 1);
    }
  });
});
