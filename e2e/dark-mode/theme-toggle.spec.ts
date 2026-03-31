import { test, expect, selectors, getThemeAttribute, goToThemedPage } from '../fixtures/setup';

test.describe('Theme Toggle Button', () => {
	test.beforeEach(async ({ page }) => {
		await goToThemedPage(page);
	});

	test('toggle button is visible in the header', async ({ page }) => {
		const button = page.locator(selectors.themeToggleButton);
		await expect(button).toBeVisible();
	});

	test('toggle button has correct accessibility attributes', async ({ page }) => {
		const button = page.locator(selectors.themeToggleButton);
		await expect(button).toHaveAttribute('aria-label', 'Toggle dark mode');
		await expect(button).toHaveAttribute('title', 'Toggle theme');
	});

	test('clicking toggle switches theme from light to dark', async ({ page }) => {
		const theme = await getThemeAttribute(page);
		expect(theme).toBe('light');

		await page.click(selectors.themeToggleButton);

		const newTheme = await getThemeAttribute(page);
		expect(newTheme).toBe('dark');
	});

	test('clicking toggle again switches theme back to light', async ({ page }) => {
		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('dark');

		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('light');
	});

	test('sun icon visible in light mode, moon icon visible in dark mode', async ({ page }) => {
		// Light mode: sun icon visible (display: block), moon icon hidden (display: none)
		const sunIcon = page.locator(selectors.sunIcon);
		const moonIcon = page.locator(selectors.moonIcon);

		await expect(sunIcon).toHaveCSS('display', 'block');
		await expect(moonIcon).toHaveCSS('display', 'none');

		// Switch to dark mode
		await page.click(selectors.themeToggleButton);

		// Dark mode: sun icon hidden, moon icon visible
		await expect(sunIcon).toHaveCSS('display', 'none');
		await expect(moonIcon).toHaveCSS('display', 'block');
	});

	test('toggle button is keyboard accessible', async ({ page }) => {
		const button = page.locator(selectors.themeToggleButton);

		// Focus the button via Tab
		await button.focus();
		await expect(button).toBeFocused();

		// Activate with Enter key
		expect(await getThemeAttribute(page)).toBe('light');
		await page.keyboard.press('Enter');
		expect(await getThemeAttribute(page)).toBe('dark');

		// Activate with Space key
		await page.keyboard.press('Space');
		expect(await getThemeAttribute(page)).toBe('light');
	});
});
