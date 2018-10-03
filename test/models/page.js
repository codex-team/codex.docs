const {expect} = require('chai');
const Page = require('../../src/models/page');
const {pages} = require('../../src/utils/database');

describe('Page model', () => {
  it('Working with empty model', async () => {
    let page = new Page();

    expect(page.data).to.be.a('object');

    let {data} = page;

    expect(data._id).to.be.undefined;
    expect(data.title).to.be.empty;
    expect(data.body).to.be.undefined;
    expect(data.parent).to.be.undefined;

    page = new Page(null);

    data = page.data;

    expect(data._id).to.be.undefined;
    expect(data.title).to.be.empty;
    expect(data.body).to.be.undefined;
    expect(data.parent).to.be.undefined;

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
    expect(data.body).to.deep.equal(initialData.body);
    expect(data.parent).to.be.undefined;

    expect(json._id).to.equal(initialData._id);
    expect(json.title).to.equal(initialData.body.blocks[0].data.text);
    expect(json.body).to.deep.equal(initialData.body);
    expect(json.parent).to.be.undefined;

    const update = {
      _id: 12345,
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
    expect(data.body).to.equal(update.body);
    expect(data.parent).to.be.undefined;
  });

  it('Saving, updating and deleting model in the database', async () => {
    const initialData = {
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
    const page = new Page(initialData);

    let savedPage = await page.save();

    expect(savedPage._id).not.be.undefined;
    expect(savedPage.title).to.equal(initialData.body.blocks[0].data.text);
    expect(savedPage.body).to.equal(initialData.body);
    expect(page._id).not.be.undefined;

    const insertedPage = await pages.findOne({_id: page._id});

    expect(insertedPage._id).to.equal(page._id);
    expect(insertedPage.title).to.equal(page.title);
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
      }
    };

    page.data = updateData;
    await page.save();

    expect(page._id).to.equal(insertedPage._id);

    const updatedPage = await pages.findOne({_id: page._id});

    expect(updatedPage._id).to.equal(savedPage._id);
    expect(updatedPage.title).to.equal(updateData.body.blocks[0].data.text);
    expect(updatedPage.body).to.deep.equal(updateData.body);

    await page.destroy();

    expect(page._id).to.be.undefined;

    const removedPage = await pages.findOne({_id: updatedPage._id});

    expect(removedPage).to.be.null;
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

    const foundPage = await Page.get(savedPage._id);

    const {data} = foundPage;

    expect(data._id).to.equal(savedPage._id);
    expect(data.title).to.equal(initialData.body.blocks[0].data.text);
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
        }
      }
    );

    child.parent = parent;

    const {_id: childId} = await child.save();

    const testedParent = await child.parent;

    expect(testedParent._id).to.equal(parentId);
    expect(testedParent.title).to.equal(parent.body.blocks[0].data.text);
    expect(testedParent.body).to.deep.equal(parent.body);

    const children = await parent.children;

    expect(children.length).to.equal(1);

    const testedChild = children.pop();

    expect(testedChild._id).to.equal(childId);
    expect(testedChild.title).to.equal(child.body.blocks[0].data.text);
    expect(testedChild.body).to.deep.equal(child.body);
    expect(testedChild._parent).to.equal(child._parent);
    expect(testedChild._parent).to.equal(parent._id);

    parent.destroy();
    child.destroy();
  });

  it('Extracting title from page body', async () => {
    const body = {
      blocks: [
        {
          type: 'header',
          data: {
            text: 'Page header'
          }
        }
      ]
    };

    const title = Page.extractTitleFromBlocks(body);

    expect(title).to.equal(body.blocks[0].data.text);
  });
});
