import twig from 'twig';
import Page from './models/page.js';
import PagesFlatArray from './models/pagesFlatArray.js';
import appConfig from './utils/appConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';
import('./utils/twig.js');
import fs from 'fs/promises';
import mkdirp from 'mkdirp';
import { createMenuTree } from './utils/menu.js';
import { EntityId } from './database/types.js';
import PagesOrder from './controllers/pagesOrder.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();
const distPath = path.resolve(cwd, 'dist');
const pagesOrder = await PagesOrder.getAll();
const allPages = await Page.getAll();

await mkdirp(distPath);

/**
 * Render template with twig by path
 *
 * @param filePath - path to template
 * @param data - data to render template
 */
function renderTemplate(filePath: string, data: Record<string, unknown>): Promise<string> {
  return new Promise((resolve, reject) => {
    twig.renderFile(path.resolve(dirname, filePath), data, (err, html) => {
      if (err) {
        reject(err);
      }
      resolve(html);
    });
  });
}

/**
 * Renders single page
 *
 * @param page - page to render
 */
async function renderPage(page: Page): Promise<void> {
  console.log(`Rendering page ${page.uri}`);
  const pageParent = await page.getParent();
  const pageId = page._id;

  if (!pageId) {
    throw new Error('Page id is not defined');
  }
  const parentIdOfRootPages = '0' as EntityId;
  const previousPage = await PagesFlatArray.getPageBefore(pageId);
  const nextPage = await PagesFlatArray.getPageAfter(pageId);
  const menu = createMenuTree(parentIdOfRootPages, allPages, pagesOrder, 2);
  const result = await renderTemplate('./views/pages/page.twig', {
    page,
    pageParent,
    previousPage,
    nextPage,
    menu,
    config: appConfig.frontend,
  });

  // console.log(result);
  const filename = page.uri === '' ? 'index.html' : `${page.uri}.html`;

  await fs.writeFile(path.resolve(distPath, filename), result);
  console.log(`Page ${page.uri} rendered`);
}

/**
 * Render all pages
 */
for (const page of allPages) {
  await renderPage(page);
}

/**
 * Render index page
 */
async function renderIndexPage(): Promise<void> {
  console.log('Rendering index page');
  const result = await renderTemplate('./views/pages/index.twig', {
    config: appConfig.frontend,
  });

  const filename = 'index.html';

  await fs.writeFile(path.resolve(distPath, filename), result);
  console.log('Index page rendered');
}

await renderIndexPage();
