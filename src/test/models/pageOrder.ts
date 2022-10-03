import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import config from 'config';
import PageOrder from '../../backend/models/pageOrder.js';
import database from '../../backend/database/index.js';
import { fileURLToPath } from 'url';

/**
 * The __dirname CommonJS variables are not available in ES modules.
 * https://nodejs.org/api/esm.html#no-__filename-or-__dirname
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pagesOrder = database['pagesOrder'];

describe('PageOrder model', () => {
  after(() => {
    const pathToDB = path.resolve(__dirname, '../../../', config.get('database'), './pagesOrder.db');

    if (fs.existsSync(pathToDB)) {
      fs.unlinkSync(pathToDB);
    }
  });

  it('Empty Model', async () => {
    const pageOrder = new PageOrder();

    expect(pageOrder.data).to.be.a('object');

    let {data} = pageOrder;

    expect(data._id).to.be.undefined;
    expect(data.page).to.be.to.equal('0');
    expect(data.order).to.be.an('array').that.is.empty;

    let page = new PageOrder();

    data = page.data;

    expect(data._id).to.be.undefined;
    expect(data.page).to.be.to.equal('0');
    expect(data.order).to.be.an('array').that.is.empty;

    const testData = {
      _id: 'order_id',
      page: 'page_id',
      order: []
    };

    page = new PageOrder(testData);
    data = page.data;

    expect(data._id).to.equal(testData._id);
    expect(data.page).to.equal(testData.page);
    expect(data.order).to.be.an('array').that.is.empty;
  });

  it('Testing Model methods', async () => {
    const testData = {
      page: 'page_id',
      order: ['1', '2']
    };
    const pageOrder = new PageOrder(testData);
    const {data} = await pageOrder.save();

    expect(data._id).not.be.undefined;
    expect(data.page).to.equal(testData.page);
    expect(data.order).to.deep.equals(testData.order);

    const insertedPageOrder = await pagesOrder.findOne({_id: data._id}) as PageOrder;
    expect(insertedPageOrder._id).to.equal(data._id);
    expect(insertedPageOrder.page).to.equal(data.page);
    expect(insertedPageOrder.order).to.deep.equal(data.order);

    const updateData = {
      page: 'page_id_2',
      order: ['3']
    };

    pageOrder.data = updateData;
    await pageOrder.save();

    expect(pageOrder.data._id).to.equal(insertedPageOrder._id);

    const updatedData = await pagesOrder.findOne({_id: insertedPageOrder._id}) as PageOrder;

    expect(updatedData.page).to.equal(updateData.page);
    expect(updatedData.order).to.deep.equal(updateData.order);

    await pageOrder.destroy();

    expect(pageOrder.data._id).to.be.undefined;

    const removedPage = await pagesOrder.findOne({_id: updatedData._id});

    expect(removedPage).to.be.null;
  });

  it('Testing push and remove order methods', async () => {
    const testData = {
      page: 'page_id',
      order: ['1', '2']
    };
    const pageOrder = new PageOrder(testData);
    await pageOrder.save();
    pageOrder.push('3');
    expect(pageOrder.data.order).to.be.an('array').that.is.not.empty;
    if (pageOrder.data.order !== undefined) {
      pageOrder.data.order.forEach((el) => {
        expect(el).to.be.an('string');
      });
    }

    expect(pageOrder.data.order).to.deep.equals(['1', '2', '3']);

    pageOrder.remove('2');
    expect(pageOrder.data.order).to.deep.equals(['1', '3']);

    expect(() => {
      pageOrder.push(3);
    }).to.throw('given id is not string');

    pageOrder.push('4');
    pageOrder.push('5');
    pageOrder.push('2');

    pageOrder.putAbove('2', '3');
    expect(pageOrder.data.order).to.deep.equals(['1', '2', '3', '4', '5']);

    pageOrder.putAbove('2', '10');
    expect(pageOrder.data.order).to.deep.equals(['1', '2', '3', '4', '5']);
    await pageOrder.destroy();
  });

  it('Testing static methods', async () => {
    const testData = {
      page: 'page_id',
      order: ['1', '2']
    };
    const pageOrder = new PageOrder(testData);
    const insertedData = await pageOrder.save();

    if (insertedData.data.page !== undefined) {
      const insertedPageOrder = await PageOrder.get(insertedData.data.page);
      expect(insertedPageOrder).to.instanceOf(PageOrder);
      expect(insertedPageOrder.data._id).to.be.equal(insertedData.data._id);
    }

    const emptyInstance = await PageOrder.get('');
    expect(emptyInstance.data.page).to.be.equal('0');
    expect(emptyInstance.data.order).to.be.an('array').that.is.empty;

    await pageOrder.destroy();
  });

  it('Testing get parents and children order methods', async () => {
    const parentTestData = {
      page: '0',
      order: ['1', '2', '3', '4', '5'],
    };
    const childTestData = {
      page: 'child',
      order: ['a', 'b', 'c', 'd', 'e'],
    };

    const parentOrder = new PageOrder(parentTestData);
    const childOrder = new PageOrder(childTestData);
    const insertedParentOrder = await parentOrder.save();
    const insertedChildOrder = await childOrder.save();
    const fetchedParentOrder = await PageOrder.getRootPageOrder();
    const fetchedChildOrder = await PageOrder.getChildPageOrder();

    expect(fetchedParentOrder.page).to.deep.equals(parentTestData.page);
    expect(fetchedParentOrder.order).to.deep.equal(parentTestData.order);
    expect(fetchedChildOrder).to.be.an('array').that.is.length(1);
    expect(fetchedChildOrder[0].page).to.deep.equals(childTestData.page);
    expect(fetchedChildOrder[0].order).to.deep.equals(childTestData.order);

    await insertedParentOrder.destroy();
    await insertedChildOrder.destroy();
  });
});
