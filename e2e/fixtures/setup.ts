import { test as base, expect, type Page } from '@playwright/test';

/**
 * CSS selectors for dark mode UI elements
 */
export const selectors = {
	themeToggleButton: 'button.theme-toggle',
	sunIcon: 'svg.theme-toggle__icon--light',
	moonIcon: 'svg.theme-toggle__icon--dark',
	header: 'header.docs-header',
	sidebar: 'div.docs-sidebar',
	sidebarContent: 'aside.docs-sidebar__content',
	pageArticle: 'article.page',
	pageContent: 'section.page__content',
	authForm: 'form.auth-form',
};

/**
 * localStorage key used by ThemeManager
 */
export const STORAGE_KEY = 'codex-docs-theme';

/**
 * Expected CSS variable values per theme (raw values as defined in .pcss files)
 */
export const themeColors = {
	light: {
		'--color-bg-main': '#fff',
		'--color-text-main': '#060c26',
		'--color-bg-light': '#f8f7fa',
		'--color-line-gray': '#e8e8eb',
	},
	dark: {
		'--color-bg-main': '#18181b',
		'--color-text-main': '#e4e4e7',
		'--color-bg-light': '#27272a',
		'--color-line-gray': '#3f3f46',
	},
};

/**
 * Helper to get a computed CSS variable value from the document root.
 * Returns the raw value as defined in the stylesheet (e.g. '#18181b'), normalized to lowercase.
 */
export async function getCSSVariable(page: Page, variable: string): Promise<string> {
	return page.evaluate((v) => {
		return getComputedStyle(document.documentElement).getPropertyValue(v).trim().toLowerCase();
	}, variable);
}

/**
 * Helper to get the current data-theme attribute value
 */
export async function getThemeAttribute(page: Page): Promise<string | null> {
	return page.evaluate(() => {
		return document.documentElement.getAttribute('data-theme');
	});
}

/**
 * Navigate to /auth page which always uses layout.twig (includes JS bundle).
 * The greeting page (/) with an empty DB does NOT include main.bundle.js,
 * so ThemeManager won't initialize there.
 */
export async function goToThemedPage(page: Page) {
	await page.goto('/auth');
	await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });
}

export { base as test, expect };
