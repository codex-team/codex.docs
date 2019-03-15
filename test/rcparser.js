const {expect} = require('chai');

require('mocha-sinon');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const rcParser = require('../src/utils/rcparser');

const rcPath = path.resolve(process.cwd(), config.rcFile);

describe('RC file parser test', () => {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
  });

  afterEach(() => {
    if (fs.existsSync(rcPath)) {
      fs.unlinkSync(rcPath);
    }
  });

  it('Default config', async () => {
    const parsedConfig = rcParser.getConfiguration();

    expect(parsedConfig).to.be.deep.equal(rcParser.DEFAULTS);
  });

  it('Invalid JSON formatted config', () => {
    const invalidJson = '{title: "Codex Docs"}';

    fs.writeFileSync(rcPath, invalidJson, 'utf8');

    const parsedConfig = rcParser.getConfiguration();

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.calledWith('CodeX Docs rc file should be in JSON format.')).to.be.true;

    expect(parsedConfig).to.be.deep.equal(rcParser.DEFAULTS);
  });

  it('Normal config', () => {
    const normalConfig = {
      title: 'Documentation',
      menu: [
        {title: 'Option 1', uri: '/option1'},
        {title: 'Option 2', uri: '/option2'},
        {title: 'Option 3', uri: '/option3'}
      ],
      misprintsChatId: 'Z50Y6LIC',
      reactions: {
        parent: '.page',
        title: 'What do you think?',
        reactions: ['👍', '👌', '👎']
      }
    };

    fs.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');

    const parsedConfig = rcParser.getConfiguration();

    expect(parsedConfig).to.be.deep.equal(normalConfig);
  });

  it('Missed title', () => {
    const normalConfig = {
      menu: [
        {title: 'Option 1', uri: '/option1'},
        {title: 'Option 2', uri: '/option2'},
        {title: 'Option 3', uri: '/option3'}
      ],
      misprintsChatId: 'Z50Y6LIC',
      reactions: {
        parent: '.page',
        title: 'What do you think?',
        reactions: ['👍', '👌', '👎']
      }
    };

    fs.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');

    const parsedConfig = rcParser.getConfiguration();

    expect(parsedConfig.menu).to.be.deep.equal(normalConfig.menu);
    expect(parsedConfig.title).to.be.equal(rcParser.DEFAULTS.title);
  });

  it('Missed menu', () => {
    const normalConfig = {
      title: 'Documentation',
      misprintsChatId: 'Z50Y6LIC',
      reactions: {
        parent: '.page',
        title: 'What do you think?',
        reactions: ['👍', '👌', '👎']
      }
    };

    fs.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');

    const parsedConfig = rcParser.getConfiguration();

    expect(parsedConfig.title).to.be.equal(normalConfig.title);
    expect(parsedConfig.menu).to.be.deep.equal(rcParser.DEFAULTS.menu);
  });

  it('Menu is not an array', () => {
    const normalConfig = {
      title: 'Documentation',
      menu: {
        0: {title: 'Option 1', uri: '/option1'},
        1: {title: 'Option 2', uri: '/option2'},
        2: {title: 'Option 3', uri: '/option3'}
      },
      misprintsChatId: 'Z50Y6LIC',
      reactions: {
        parent: '.page',
        title: 'What do you think?',
        reactions: ['👍', '👌', '👎']
      }
    };

    fs.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');

    const parsedConfig = rcParser.getConfiguration();

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.calledWith('Menu section in the rc file must be an array.')).to.be.true;

    expect(parsedConfig.title).to.be.equal(normalConfig.title);
    expect(parsedConfig.menu).to.be.deep.equal(rcParser.DEFAULTS.menu);
  });

  it('Menu option is a string', () => {
    const normalConfig = {
      title: 'Documentation',
      menu: [
        'Option 1',
        {title: 'Option 2', uri: '/option2'},
        {title: 'Option 3', uri: '/option3'}
      ],
      misprintsChatId: 'Z50Y6LIC',
      reactions: {
        parent: '.page',
        title: 'What do you think?',
        reactions: ['👍', '👌', '👎']
      }
    };

    const expectedMenu = [
      {title: 'Option 1', uri: '/option-1'},
      {title: 'Option 2', uri: '/option2'},
      {title: 'Option 3', uri: '/option3'}
    ];

    fs.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');

    const parsedConfig = rcParser.getConfiguration();

    expect(parsedConfig.title).to.be.equal(normalConfig.title);
    expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
  });

  it('Menu option is not a string or an object', () => {
    const normalConfig = {
      title: 'Documentation',
      menu: [
        [ {title: 'Option 1', uri: '/option1'} ],
        {title: 'Option 2', uri: '/option2'},
        {title: 'Option 3', uri: '/option3'}
      ],
      misprintsChatId: 'Z50Y6LIC',
      reactions: {
        parent: '.page',
        title: 'What do you think?',
        reactions: ['👍', '👌', '👎']
      }
    };

    const expectedMenu = [
      {title: 'Option 2', uri: '/option2'},
      {title: 'Option 3', uri: '/option3'}
    ];

    fs.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');

    const parsedConfig = rcParser.getConfiguration();

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.calledWith('Menu option #1 in rc file must be a string or an object')).to.be.true;

    expect(parsedConfig.title).to.be.equal(normalConfig.title);
    expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
  });

  it('Menu option title is undefined', () => {
    const normalConfig = {
      title: 'Documentation',
      menu: [
        {uri: '/option1'},
        {title: 'Option 2', uri: '/option2'},
        {title: 'Option 3', uri: '/option3'}
      ],
      misprintsChatId: 'Z50Y6LIC',
      reactions: {
        parent: '.page',
        title: 'What do you think?',
        reactions: ['👍', '👌', '👎']
      }
    };

    const expectedMenu = [
      {title: 'Option 2', uri: '/option2'},
      {title: 'Option 3', uri: '/option3'}
    ];

    fs.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');

    const parsedConfig = rcParser.getConfiguration();

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.calledWith('Menu option #1 title must be a string.')).to.be.true;

    expect(parsedConfig.title).to.be.equal(normalConfig.title);
    expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
  });

  it('Menu option title is not a string', () => {
    const normalConfig = {
      title: 'Documentation',
      menu: [
        {title: [], uri: '/option1'},
        {title: 'Option 2', uri: '/option2'},
        {title: 'Option 3', uri: '/option3'}
      ],
      misprintsChatId: 'Z50Y6LIC',
      reactions: {
        parent: '.page',
        title: 'What do you think?',
        reactions: ['👍', '👌', '👎']
      }
    };

    const expectedMenu = [
      {title: 'Option 2', uri: '/option2'},
      {title: 'Option 3', uri: '/option3'}
    ];

    fs.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');

    const parsedConfig = rcParser.getConfiguration();

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.calledWith('Menu option #1 title must be a string.')).to.be.true;

    expect(parsedConfig.title).to.be.equal(normalConfig.title);
    expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
  });

  it('Menu option uri is undefined', () => {
    const normalConfig = {
      title: 'Documentation',
      menu: [
        {title: 'Option 1'},
        {title: 'Option 2', uri: '/option2'},
        {title: 'Option 3', uri: '/option3'}
      ],
      misprintsChatId: 'Z50Y6LIC',
      reactions: {
        parent: '.page',
        title: 'What do you think?',
        reactions: ['👍', '👌', '👎']
      }
    };

    const expectedMenu = [
      {title: 'Option 2', uri: '/option2'},
      {title: 'Option 3', uri: '/option3'}
    ];

    fs.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');

    const parsedConfig = rcParser.getConfiguration();

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.calledWith('Menu option #1 uri must be a string.')).to.be.true;

    expect(parsedConfig.title).to.be.equal(normalConfig.title);
    expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
  });

  it('Menu option title is not a string', () => {
    const normalConfig = {
      title: 'Documentation',
      menu: [
        {title: 'Option 1', uri: []},
        {title: 'Option 2', uri: '/option2'},
        {title: 'Option 3', uri: '/option3'}
      ],
      misprintsChatId: 'Z50Y6LIC',
      reactions: {
        parent: '.page',
        title: 'What do you think?',
        reactions: ['👍', '👌', '👎']
      }
    };

    const expectedMenu = [
      {title: 'Option 2', uri: '/option2'},
      {title: 'Option 3', uri: '/option3'}
    ];

    fs.writeFileSync(rcPath, JSON.stringify(normalConfig), 'utf8');

    const parsedConfig = rcParser.getConfiguration();

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.calledWith('Menu option #1 uri must be a string.')).to.be.true;

    expect(parsedConfig.title).to.be.equal(normalConfig.title);
    expect(parsedConfig.menu).to.be.deep.equal(expectedMenu);
  });
});
