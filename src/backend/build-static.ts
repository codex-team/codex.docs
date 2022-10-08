import twig from 'twig';
import Page from './models/page.js';
import PagesFlatArray from './models/pagesFlatArray.js';
import path from 'path';
import { fileURLToPath } from 'url';
import('./utils/twig.js');
import fs from 'fs/promises';
import mkdirp from 'mkdirp';
import { createMenuTree } from './utils/menu.js';
import { EntityId } from './database/types.js';
import PagesOrder from './controllers/pagesOrder.js';
import fse from 'fs-extra';
import appConfig  from './utils/appConfig.js';
import Aliases from './controllers/aliases.js';
import Pages from './controllers/pages.js';

/**
 * Build static pages from database
 */
export default async function buildStatic(): Promise<void> {
  const config = appConfig.staticBuild;

  if (!config) {
    throw new Error('Static build config not found');
  }

  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const cwd = process.cwd();
  const distPath = path.resolve(cwd, config.outputDir);

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

  console.log('Remove old static files');
  await fse.remove(distPath);

  console.log('Building static files');
  const pagesOrder = await PagesOrder.getAll();
  const allPages = await Page.getAll();

  await mkdirp(distPath);

  /**
   * Renders single page
   *
   * @param page - page to render
   * @param isIndex - is this page index page
   */
  async function renderPage(page: Page, isIndex?: boolean): Promise<void> {
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

    const filename = (isIndex || page.uri === '') ? 'index.html' : `${page.uri}.html`;

    await fs.writeFile(path.resolve(distPath, filename), result);
    console.log(`Page ${page.uri} rendered`);
  }

  /**
   * Render index page
   *
   * @param indexPageUri - uri of index page
   */
  async function renderIndexPage(indexPageUri: string): Promise<void> {
    const alias = await Aliases.get(indexPageUri);

    if (!alias.id) {
      throw new Error(`Alias ${indexPageUri} not found`);
    }

    const page = await Pages.get(alias.id);

    console.log(page);

    await renderPage(page, true);
  }

  /**
   * Render all pages
   */
  for (const page of allPages) {
    await renderPage(page);
  }

  await renderIndexPage(config.indexPageUri);

  await fse.copy(path.resolve(dirname, '../../public'), distPath);
  console.log('Static files built');
}

