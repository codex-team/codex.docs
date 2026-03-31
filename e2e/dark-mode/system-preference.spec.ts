import { test, expect, STORAGE_KEY, getThemeAttribute, selectors } from '../fixtures/setup';

test.describe('System Preference Detection', () => {
	test('respects system dark preference when no saved preference', async ({ browser }) => {
		const context = await browser.newContext({
			colorScheme: 'dark',
		});
		const page = await context.newPage();

		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		expect(await getThemeAttribute(page)).toBe('dark');

		await context.close();
	});

	test('respects system light preference when no saved preference', async ({ browser }) => {
		const context = await browser.newContext({
			colorScheme: 'light',
		});
		const page = await context.newPage();

		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		expect(await getThemeAttribute(page)).toBe('light');

		await context.close();
	});

	test('saved preference overrides system dark preference', async ({ browser }) => {
		const context = await browser.newContext({
			colorScheme: 'dark',
		});
		const page = await context.newPage();

		// Set localStorage to light before navigating
		await page.goto('/auth');
		await page.evaluate((key) => localStorage.setItem(key, 'light'), STORAGE_KEY);

		// Reload to let ThemeManager pick up the saved preference
		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		// Saved preference (light) should override system preference (dark)
		expect(await getThemeAttribute(page)).toBe('light');

		await context.close();
	});

	test('saved preference overrides system light preference', async ({ browser }) => {
		const context = await browser.newContext({
			colorScheme: 'light',
		});
		const page = await context.newPage();

		// Set localStorage to dark before navigating
		await page.goto('/auth');
		await page.evaluate((key) => localStorage.setItem(key, 'dark'), STORAGE_KEY);

		// Reload to let ThemeManager pick up the saved preference
		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		// Saved preference (dark) should override system preference (light)
		expect(await getThemeAttribute(page)).toBe('dark');

		await context.close();
	});
});
