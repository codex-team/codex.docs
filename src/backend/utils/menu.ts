import { EntityId } from '../database/types.js';
import Page from '../models/page.js';
import PageOrder from '../models/pageOrder.js';
import { isEqualIds } from '../database/index.js';

/** Max sidebar nesting depth (root sections count as depth 1). */
const MENU_MAX_DEPTH = 64;

/**
 * Build parent→children menu tree for the sidebar.
 *
 * @param parentPageId - parent page id
 * @param pages - list of all available pages
 * @param pagesOrder - list of pages order
 * @param maxDepth - stop recursing deeper than this (default: MENU_MAX_DEPTH)
 * currentDepth - current depth from the tree root (1 = direct children of parentPageId)
 */
export function createMenuTree(
  parentPageId: EntityId,
  pages: Page[],
  pagesOrder: PageOrder[],
  maxDepth: number = MENU_MAX_DEPTH,
  currentDepth: number = 1
): Page[] {
  const childrenOrder = pagesOrder.find((order) => isEqualIds(order.data.page, parentPageId));

  /**
   * branch is a page children in tree
   * if we got some children order on parents tree, then we push found pages in order sequence
   * otherwise just find all pages includes parent tree
   */
  let ordered: any[] = [];

  if (childrenOrder) {
    ordered = childrenOrder.order.map((pageId: EntityId) => {
      return pages.find(page => isEqualIds(page._id, pageId));
    });
  }

  const unordered = pages.filter(page => isEqualIds(page._parent, parentPageId));
  const branch = Array.from(new Set([...ordered, ...unordered]));

  const canRecurse = currentDepth < maxDepth;

  /**
   * Each parents children can have subbranches
   */
  return branch
    .filter((page) => page && page._id)
    .map((page) => {
      const subtree = canRecurse
        ? createMenuTree(page._id!, pages, pagesOrder, maxDepth, currentDepth + 1)
        : [];

      /** `children` must win over anything stored on the page document */
      return { ...page.data, children: subtree };
    });
}
