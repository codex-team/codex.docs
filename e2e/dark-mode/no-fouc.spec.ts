import { test, expect, STORAGE_KEY, getThemeAttribute, selectors } from '../fixtures/setup';

test.describe('No Flash of Unstyled Content (FOUC)', () => {
	test('dark theme is applied before page renders when localStorage has dark preference', async ({ page }) => {
		// First visit to set up localStorage
		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });
		await page.evaluate((key) => localStorage.setItem(key, 'dark'), STORAGE_KEY);

		// Navigate to a new page — theme should be correct on first check
		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		// data-theme should be 'dark' immediately
		const theme = await getThemeAttribute(page);
		expect(theme).toBe('dark');
	});

	test('light theme is applied before page renders when localStorage has light preference', async ({ page }) => {
		// First visit to set up localStorage
		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });
		await page.evaluate((key) => localStorage.setItem(key, 'light'), STORAGE_KEY);

		// Navigate to a new page
		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		const theme = await getThemeAttribute(page);
		expect(theme).toBe('light');
	});

	test('data-theme attribute exists on html element after page load', async ({ page }) => {
		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		const hasAttribute = await page.evaluate(() => {
			return document.documentElement.hasAttribute('data-theme');
		});
		expect(hasAttribute).toBe(true);
	});

	test('theme is consistent between data-attribute and CSS variables after reload', async ({ page }) => {
		// Set dark theme
		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });
		await page.evaluate((key) => localStorage.setItem(key, 'dark'), STORAGE_KEY);

		// Reload
		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		// Check that data-theme and CSS variables are both dark
		const theme = await getThemeAttribute(page);
		expect(theme).toBe('dark');

		const bgColor = await page.evaluate(() => {
			return getComputedStyle(document.documentElement).getPropertyValue('--color-bg-main').trim().toLowerCase();
		});
		// Dark mode background should be #18181B (zinc-900)
		expect(bgColor).toBe('#18181b');
	});
});
