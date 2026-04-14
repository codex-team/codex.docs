import Page from '../models/page.js';

type BreadcrumbItem = {
  title: string;
  href: string | null;
  isEllipsis?: boolean;
};

function hrefForPage(p: Page): string {
  if (p.uri) {
    return `/${p.uri}`;
  }

  return `/page/${p._id}`;
}

/**
 * At most 3 segments after "Documentation": first ancestor, optional middle ellipsis, current page.
 * Shallow trees (≤2 segments) show everything without ellipsis.
 */
function collapseToFirstEllipsisCurrent(items: BreadcrumbItem[]): BreadcrumbItem[] {
  if (items.length <= 2) {
    return items;
  }

  return [
    items[0],
    { title: '…', href: null, isEllipsis: true },
    items[items.length - 1],
  ];
}

/**
 * Breadcrumb trail: ancestors (linked) + current page (plain text, last).
 */
export async function buildPageBreadcrumbs(page: Page): Promise<BreadcrumbItem[]> {
  const ancestors = await page.getAncestorChain();
  const items: BreadcrumbItem[] = ancestors.map(a => ({
    title: a.title ?? '',
    href: hrefForPage(a),
  }));

  items.push({
    title: page.title ?? '',
    href: null,
  });

  return collapseToFirstEllipsisCurrent(items);
}
