import { test, expect, STORAGE_KEY, getThemeAttribute, goToThemedPage, selectors, getCSSVariable, themeColors } from '../fixtures/setup';

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

test.describe('Theme Persistence — Edge Cases (FR-2.2)', () => {
	test('theme persists across page navigation', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('dark');

		// Navigate to a different page
		await page.goto('/');
		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		expect(await getThemeAttribute(page)).toBe('dark');
	});

	test('clearing localStorage resets to default light mode', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('dark');

		// Clear storage and reload
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		expect(await getThemeAttribute(page)).toBe('light');
	});

	test('removing only the theme key resets to default', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		expect(await getThemeAttribute(page)).toBe('light');
	});

	test('invalid localStorage value does not crash theme initialization', async ({ page }) => {
		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		// Set an invalid theme value
		await page.evaluate((key) => localStorage.setItem(key, 'invalid-theme'), STORAGE_KEY);
		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		// Page should still work — toggle should still function
		await page.click(selectors.themeToggleButton);
		const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
		expect(['light', 'dark']).toContain(stored);
	});

	test('rapid toggles persist the final state', async ({ page }) => {
		await goToThemedPage(page);

		// Toggle 7 times — odd count means dark
		for (let i = 0; i < 7; i++) {
			await page.click(selectors.themeToggleButton);
		}

		const finalTheme = await getThemeAttribute(page);
		const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
		expect(stored).toBe(finalTheme);

		// Reload and verify persistence
		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });
		expect(await getThemeAttribute(page)).toBe(finalTheme);
	});

	test('localStorage stores only valid string values (not objects)', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		const stored = await page.evaluate((key) => {
			const val = localStorage.getItem(key);
			return {
				value: val,
				type: typeof val,
				isJSON: (() => { try { JSON.parse(val!); return typeof JSON.parse(val!) === 'object'; } catch { return false; } })(),
			};
		}, STORAGE_KEY);

		expect(stored.type).toBe('string');
		expect(stored.isJSON).toBe(false);
		expect(['light', 'dark']).toContain(stored.value);
	});

	test('theme preference does not leak into other storage keys', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		const themeKeys = await page.evaluate(() => {
			return Object.keys(localStorage).filter(k => k.includes('theme') || k.includes('dark') || k.includes('mode'));
		});

		// Only our key should be theme-related
		expect(themeKeys).toEqual(['codex-docs-theme']);
	});

	test('CSS variables match persisted theme after reload', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('dark');

		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		// Verify CSS variables are dark mode values, not just the attribute
		const bgMain = await getCSSVariable(page, '--color-bg-main');
		const textMain = await getCSSVariable(page, '--color-text-main');
		expect(bgMain).toBe(themeColors.dark['--color-bg-main']);
		expect(textMain).toBe(themeColors.dark['--color-text-main']);
	});

	test('toggle icon state matches persisted theme after reload', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('dark');

		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		// In dark mode: sun icon hidden, moon icon visible
		const sunIcon = page.locator(selectors.sunIcon);
		const moonIcon = page.locator(selectors.moonIcon);
		await expect(sunIcon).toHaveCSS('display', 'none');
		await expect(moonIcon).toHaveCSS('display', 'block');
	});
});
