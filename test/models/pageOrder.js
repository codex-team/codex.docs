const {expect} = require('chai');
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const PageOrder = require('../../src/models/pageOrder');
const {pagesOrder} = require('../../src/utils/database');

describe('PageOrder model', () => {
  after(() => {
    const pathToDB = path.resolve(__dirname, '../../', config.database, './pages.db');

    if (fs.existsSync(pathToDB)) {
      fs.unlinkSync(pathToDB);
    }
  });

  it('Empty Model', async () => {
    let pageOrder = new PageOrder();

    expect(pageOrder.data).to.be.a('object');

    let {data} = pageOrder;

    expect(data._id).to.be.undefined;
    expect(data.page).to.be.to.equal('0');
    expect(data.order).to.be.an('array').that.is.empty;

    page = new PageOrder(null);

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
    let {data} = await pageOrder.save();

    expect(data._id).not.be.undefined;
    expect(data.page).to.equal(testData.page);
    expect(data.order).to.deep.equals(testData.order);

    const insertedPageOrder = await pagesOrder.findOne({_id: data._id});
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

    const updatedData = await pagesOrder.findOne({_id: insertedPageOrder._id});

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
    pageOrder.data.order.forEach((el) => {
      expect(el).to.be.an('string')
    });

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

    const insertedPageOrder = await PageOrder.get(insertedData.data.page);
    expect(insertedPageOrder).to.instanceOf(PageOrder);
    expect(insertedPageOrder.data._id).to.be.equal(insertedData.data._id);

    const emptyInstance = await PageOrder.get(null);
    expect(emptyInstance.data.page).to.be.equal('0');
    expect(emptyInstance.data.order).to.be.an('array').that.is.empty;

    await pageOrder.destroy();
  });
});
