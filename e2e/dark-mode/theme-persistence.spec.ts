import { test, expect, STORAGE_KEY, getThemeAttribute, goToThemedPage, selectors } from '../fixtures/setup';

test.describe('Theme Persistence', () => {
	test('defaults to light mode when no saved preference', async ({ page }) => {
		await goToThemedPage(page);

		expect(await getThemeAttribute(page)).toBe('light');

		const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
		expect(stored).toBeNull();
	});

	test('saves theme preference to localStorage on toggle', async ({ page }) => {
		await goToThemedPage(page);

		await page.click(selectors.themeToggleButton);

		const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
		expect(stored).toBe('dark');
	});

	test('restores dark theme from localStorage on page reload', async ({ page }) => {
		await goToThemedPage(page);

		// Switch to dark mode
		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('dark');

		// Reload the page
		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		// Theme should still be dark
		expect(await getThemeAttribute(page)).toBe('dark');
	});

	test('restores light theme from localStorage on page reload', async ({ page }) => {
		await goToThemedPage(page);

		// Toggle to dark, then back to light
		await page.click(selectors.themeToggleButton);
		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('light');

		// Reload
		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		expect(await getThemeAttribute(page)).toBe('light');
	});

	test('localStorage key is codex-docs-theme', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		const allKeys = await page.evaluate(() => Object.keys(localStorage));
		expect(allKeys).toContain('codex-docs-theme');
	});
});
