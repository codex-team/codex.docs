import { test, expect, selectors, getCSSVariable, getThemeAttribute, goToThemedPage, STORAGE_KEY, themeColors } from '../fixtures/setup';

/**
 * Phase 3.5 — Browser Compatibility Tests (NFR-3.3)
 *
 * Run across Chromium, Firefox, and WebKit to verify:
 * - CSS custom properties work correctly
 * - data-theme attribute selector mechanism
 * - localStorage persistence
 * - matchMedia / prefers-color-scheme
 * - Theme toggle interaction
 * - No browser-specific rendering issues
 */

test.describe('Cross-Browser: CSS Custom Properties', () => {
	test('CSS variables resolve in light mode', async ({ page }) => {
		await goToThemedPage(page);

		for (const [variable, expected] of Object.entries(themeColors.light)) {
			const value = await getCSSVariable(page, variable);
			expect(value, `${variable} should be ${expected}`).toBe(expected);
		}
	});

	test('CSS variables resolve in dark mode', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		for (const [variable, expected] of Object.entries(themeColors.dark)) {
			const value = await getCSSVariable(page, variable);
			expect(value, `${variable} should be ${expected}`).toBe(expected);
		}
	});

	test('[data-theme] selector overrides :root values', async ({ page }) => {
		await goToThemedPage(page);

		const result = await page.evaluate(() => {
			const before = getComputedStyle(document.documentElement)
				.getPropertyValue('--color-bg-main').trim().toLowerCase();

			document.documentElement.setAttribute('data-theme', 'dark');

			const after = getComputedStyle(document.documentElement)
				.getPropertyValue('--color-bg-main').trim().toLowerCase();

			return { before, after };
		});

		expect(result.before).toBe('#fff');
		expect(result.after).toBe('#18181b');
	});
});

test.describe('Cross-Browser: Theme Toggle', () => {
	test('click toggles light to dark', async ({ page }) => {
		await goToThemedPage(page);
		expect(await getThemeAttribute(page)).toBe('light');

		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('dark');
	});

	test('click toggles dark to light', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('dark');

		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('light');
	});

	test('icon visibility updates on toggle', async ({ page }) => {
		await goToThemedPage(page);

		const sunIcon = page.locator(selectors.sunIcon);
		const moonIcon = page.locator(selectors.moonIcon);

		await expect(sunIcon).toHaveCSS('display', 'block');
		await expect(moonIcon).toHaveCSS('display', 'none');

		await page.click(selectors.themeToggleButton);

		await expect(sunIcon).toHaveCSS('display', 'none');
		await expect(moonIcon).toHaveCSS('display', 'block');
	});

	test('keyboard activation works', async ({ page }) => {
		await goToThemedPage(page);
		const button = page.locator(selectors.themeToggleButton);
		await button.focus();

		await page.keyboard.press('Enter');
		expect(await getThemeAttribute(page)).toBe('dark');

		await page.keyboard.press('Space');
		expect(await getThemeAttribute(page)).toBe('light');
	});
});

test.describe('Cross-Browser: localStorage Persistence', () => {
	test('theme saves to localStorage', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
		expect(stored).toBe('dark');
	});

	test('theme restores from localStorage after reload', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		expect(await getThemeAttribute(page)).toBe('dark');
	});

	test('localStorage API is available', async ({ page }) => {
		await goToThemedPage(page);

		const available = await page.evaluate(() => {
			try {
				const testKey = '__storage_test__';
				localStorage.setItem(testKey, 'test');
				localStorage.removeItem(testKey);
				return true;
			} catch {
				return false;
			}
		});

		expect(available).toBe(true);
	});
});

test.describe('Cross-Browser: System Preference Detection', () => {
	test('matchMedia API is available', async ({ page }) => {
		await goToThemedPage(page);

		const available = await page.evaluate(() => {
			return typeof window.matchMedia === 'function';
		});

		expect(available).toBe(true);
	});

	test('prefers-color-scheme: dark is detected when emulated', async ({ page }) => {
		await goToThemedPage(page);
		await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);

		await page.emulateMedia({ colorScheme: 'dark' });

		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		expect(await getThemeAttribute(page)).toBe('dark');
	});

	test('prefers-color-scheme: light is detected when emulated', async ({ page }) => {
		await goToThemedPage(page);
		await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);

		await page.emulateMedia({ colorScheme: 'light' });

		await page.reload();
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		expect(await getThemeAttribute(page)).toBe('light');
	});
});

test.describe('Cross-Browser: Rendered Colors', () => {
	test('body background is correct in dark mode', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		expect(bodyBg).toBe('rgb(24, 24, 27)');
	});

	test('body background is correct in light mode', async ({ page }) => {
		await goToThemedPage(page);

		const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		expect(bodyBg).toBe('rgb(255, 255, 255)');
	});

	test('text color updates in dark mode', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		const bodyColor = await page.evaluate(() => getComputedStyle(document.body).color);
		expect(bodyColor).toBe('rgb(228, 228, 231)');
	});

	test('header background matches theme', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		const headerBg = await page.evaluate(() => {
			const header = document.querySelector('header.docs-header');
			return header ? getComputedStyle(header).backgroundColor : '';
		});
		expect(headerBg).toBe('rgb(24, 24, 27)');
	});
});

test.describe('Cross-Browser: CustomEvent & API Support', () => {
	test('CustomEvent dispatches correctly', async ({ page }) => {
		await goToThemedPage(page);

		const received = await page.evaluate(() => {
			return new Promise<boolean>((resolve) => {
				document.addEventListener('themeChange', (e: Event) => {
					resolve((e as CustomEvent).detail?.theme === 'test');
				});
				document.dispatchEvent(new CustomEvent('themeChange', {
					detail: { theme: 'test' },
				}));
			});
		});

		expect(received).toBe(true);
	});

	test('MutationObserver detects data-theme attribute changes', async ({ page }) => {
		await goToThemedPage(page);

		const detected = await page.evaluate(() => {
			return new Promise<boolean>((resolve) => {
				const observer = new MutationObserver((mutations) => {
					for (const m of mutations) {
						if (m.attributeName === 'data-theme') {
							observer.disconnect();
							resolve(true);
						}
					}
				});
				observer.observe(document.documentElement, { attributes: true });
				document.documentElement.setAttribute('data-theme', 'dark');
			});
		});

		expect(detected).toBe(true);
	});
});
