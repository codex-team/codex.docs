import { test, expect, selectors, getCSSVariable, getThemeAttribute, goToThemedPage, themeColors } from '../fixtures/setup';

test.describe('Component Styles - Light Mode', () => {
	test.beforeEach(async ({ page }) => {
		await goToThemedPage(page);
		expect(await getThemeAttribute(page)).toBe('light');
	});

	test('header has correct light mode colors', async ({ page }) => {
		const bgColor = await getCSSVariable(page, '--color-bg-main');
		expect(bgColor).toBe(themeColors.light['--color-bg-main']);
	});

	test('body text uses light mode color', async ({ page }) => {
		const textColor = await getCSSVariable(page, '--color-text-main');
		expect(textColor).toBe(themeColors.light['--color-text-main']);
	});

	test('border uses light mode color', async ({ page }) => {
		const borderColor = await getCSSVariable(page, '--color-line-gray');
		expect(borderColor).toBe(themeColors.light['--color-line-gray']);
	});
});

test.describe('Component Styles - Dark Mode', () => {
	test.beforeEach(async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('dark');
	});

	test('background uses dark mode color', async ({ page }) => {
		const bgColor = await getCSSVariable(page, '--color-bg-main');
		expect(bgColor).toBe(themeColors.dark['--color-bg-main']);
	});

	test('text uses dark mode color', async ({ page }) => {
		const textColor = await getCSSVariable(page, '--color-text-main');
		expect(textColor).toBe(themeColors.dark['--color-text-main']);
	});

	test('border uses dark mode color', async ({ page }) => {
		const borderColor = await getCSSVariable(page, '--color-line-gray');
		expect(borderColor).toBe(themeColors.dark['--color-line-gray']);
	});

	test('background light variable uses dark mode value', async ({ page }) => {
		const bgLight = await getCSSVariable(page, '--color-bg-light');
		expect(bgLight).toBe(themeColors.dark['--color-bg-light']);
	});
});

test.describe('Rendered Element Colors', () => {
	test('body background is dark in dark mode', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		expect(bodyBg).toBe('rgb(24, 24, 27)');
	});

	test('body background is white in light mode', async ({ page }) => {
		await goToThemedPage(page);

		const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		expect(bodyBg).toBe('rgb(255, 255, 255)');
	});

	test('header background is dark in dark mode', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		const headerBg = await page.evaluate(() => {
			const header = document.querySelector('header.docs-header');
			return header ? getComputedStyle(header).backgroundColor : '';
		});
		expect(headerBg).toBe('rgb(24, 24, 27)');
	});

	test('header background is white in light mode', async ({ page }) => {
		await goToThemedPage(page);

		const headerBg = await page.evaluate(() => {
			const header = document.querySelector('header.docs-header');
			return header ? getComputedStyle(header).backgroundColor : '';
		});
		expect(headerBg).toBe('rgb(255, 255, 255)');
	});

	test('body text color changes in dark mode', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		const bodyColor = await page.evaluate(() => getComputedStyle(document.body).color);
		expect(bodyColor).toBe('rgb(228, 228, 231)');
	});
});

test.describe('Component Styles - Toggle Consistency', () => {
	test('all CSS variables update when toggling from light to dark', async ({ page }) => {
		await goToThemedPage(page);

		// Verify light mode variables
		for (const [variable, expected] of Object.entries(themeColors.light)) {
			const value = await getCSSVariable(page, variable);
			expect(value, `Light mode ${variable}`).toBe(expected);
		}

		// Toggle to dark
		await page.click(selectors.themeToggleButton);

		// Verify dark mode variables
		for (const [variable, expected] of Object.entries(themeColors.dark)) {
			const value = await getCSSVariable(page, variable);
			expect(value, `Dark mode ${variable}`).toBe(expected);
		}
	});

	test('auth form is visible in both themes', async ({ page }) => {
		await goToThemedPage(page);
		const form = page.locator(selectors.authForm);
		await expect(form).toBeVisible();

		// Toggle to dark
		await page.click(selectors.themeToggleButton);
		await expect(form).toBeVisible();
	});

	test('header remains visible after theme switch', async ({ page }) => {
		await goToThemedPage(page);
		const header = page.locator(selectors.header);
		await expect(header).toBeVisible();

		await page.click(selectors.themeToggleButton);
		await expect(header).toBeVisible();
	});

	test('toggle button icon swaps correctly on multiple toggles', async ({ page }) => {
		await goToThemedPage(page);
		const sunIcon = page.locator(selectors.sunIcon);
		const moonIcon = page.locator(selectors.moonIcon);

		// Light → sun visible
		await expect(sunIcon).toHaveCSS('display', 'block');
		await expect(moonIcon).toHaveCSS('display', 'none');

		// Toggle 1: dark → moon visible
		await page.click(selectors.themeToggleButton);
		await expect(sunIcon).toHaveCSS('display', 'none');
		await expect(moonIcon).toHaveCSS('display', 'block');

		// Toggle 2: light → sun visible
		await page.click(selectors.themeToggleButton);
		await expect(sunIcon).toHaveCSS('display', 'block');
		await expect(moonIcon).toHaveCSS('display', 'none');

		// Toggle 3: dark → moon visible
		await page.click(selectors.themeToggleButton);
		await expect(sunIcon).toHaveCSS('display', 'none');
		await expect(moonIcon).toHaveCSS('display', 'block');
	});
});
