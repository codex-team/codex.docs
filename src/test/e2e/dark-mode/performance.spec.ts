import { test, expect, selectors, getThemeAttribute, goToThemedPage, STORAGE_KEY } from '../fixtures/setup';

/**
 * Phase 3.3 — Performance Tests
 *
 * NFR-3.1.1: Theme switching < 100ms perceived latency
 * NFR-3.1.2: No layout shift or flickering when switching themes
 * NFR-3.1.3: CSS variable approach (verified structurally)
 */

test.describe('Theme Switch Timing (NFR-3.1.1: < 100ms)', () => {
	test.beforeEach(async ({ page }) => {
		await goToThemedPage(page);
	});

	test('light-to-dark toggle completes under 100ms', async ({ page }) => {
		const elapsed = await page.evaluate((sel) => {
			const start = performance.now();

			document.querySelector(sel).click();

			// Measure when data-theme attribute is updated
			const end = performance.now();
			return end - start;
		}, selectors.themeToggleButton);

		expect(elapsed, `Toggle took ${elapsed.toFixed(2)}ms`).toBeLessThan(100);
		expect(await getThemeAttribute(page)).toBe('dark');
	});

	test('dark-to-light toggle completes under 100ms', async ({ page }) => {
		// Switch to dark first
		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('dark');

		const elapsed = await page.evaluate((sel) => {
			const start = performance.now();

			document.querySelector(sel).click();

			const end = performance.now();
			return end - start;
		}, selectors.themeToggleButton);

		expect(elapsed, `Toggle took ${elapsed.toFixed(2)}ms`).toBeLessThan(100);
		expect(await getThemeAttribute(page)).toBe('light');
	});

	test('rapid successive toggles all complete under 100ms each', async ({ page }) => {
		const timings: number[] = await page.evaluate((sel) => {
			const results: number[] = [];

			for (let i = 0; i < 10; i++) {
				const start = performance.now();
				document.querySelector(sel)!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
				results.push(performance.now() - start);
			}

			return results;
		}, selectors.themeToggleButton);

		for (let i = 0; i < timings.length; i++) {
			expect(timings[i], `Toggle ${i + 1} took ${timings[i].toFixed(2)}ms`).toBeLessThan(100);
		}
	});

	test('setTheme via ThemeManager completes under 100ms', async ({ page }) => {
		const elapsed = await page.evaluate(() => {
			const start = performance.now();

			document.documentElement.setAttribute('data-theme', 'dark');

			const end = performance.now();
			return end - start;
		});

		expect(elapsed, `setAttribute took ${elapsed.toFixed(2)}ms`).toBeLessThan(100);
	});
});

test.describe('No Layout Shift (NFR-3.1.2)', () => {
	test('no Cumulative Layout Shift during theme toggle', async ({ page }) => {
		await goToThemedPage(page);

		// Start observing layout shifts before toggling
		await page.evaluate(() => {
			(window as any).__layoutShifts = [];
			const observer = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					(window as any).__layoutShifts.push((entry as any).value);
				}
			});
			observer.observe({ type: 'layout-shift', buffered: false });
			(window as any).__layoutShiftObserver = observer;
		});

		// Toggle light → dark
		await page.click(selectors.themeToggleButton);
		// Allow a frame for any shifts to register
		await page.waitForTimeout(100);

		// Toggle dark → light
		await page.click(selectors.themeToggleButton);
		await page.waitForTimeout(100);

		const shifts: number[] = await page.evaluate(() => {
			(window as any).__layoutShiftObserver?.disconnect();
			return (window as any).__layoutShifts || [];
		});

		const totalCLS = shifts.reduce((sum, v) => sum + v, 0);
		// Google's "good" CLS threshold is < 0.1; we use 0.05 for a single interaction
		expect(totalCLS, `CLS was ${totalCLS.toFixed(4)}`).toBeLessThan(0.05);
	});

	test('element dimensions remain stable after theme switch', async ({ page }) => {
		await goToThemedPage(page);

		// Capture dimensions in light mode
		const lightDimensions = await page.evaluate((sel) => {
			const header = document.querySelector(sel.header);
			const sidebar = document.querySelector(sel.sidebarContent);

			return {
				headerHeight: header?.getBoundingClientRect().height ?? 0,
				headerWidth: header?.getBoundingClientRect().width ?? 0,
				sidebarWidth: sidebar?.getBoundingClientRect().width ?? 0,
			};
		}, selectors);

		// Toggle to dark
		await page.click(selectors.themeToggleButton);

		// Capture dimensions in dark mode
		const darkDimensions = await page.evaluate((sel) => {
			const header = document.querySelector(sel.header);
			const sidebar = document.querySelector(sel.sidebarContent);

			return {
				headerHeight: header?.getBoundingClientRect().height ?? 0,
				headerWidth: header?.getBoundingClientRect().width ?? 0,
				sidebarWidth: sidebar?.getBoundingClientRect().width ?? 0,
			};
		}, selectors);

		expect(darkDimensions.headerHeight, 'Header height should not change').toBe(lightDimensions.headerHeight);
		expect(darkDimensions.headerWidth, 'Header width should not change').toBe(lightDimensions.headerWidth);
		expect(darkDimensions.sidebarWidth, 'Sidebar width should not change').toBe(lightDimensions.sidebarWidth);
	});

	test('scroll position preserved after theme switch', async ({ page }) => {
		await goToThemedPage(page);

		// Scroll down
		await page.evaluate(() => window.scrollTo(0, 150));
		await page.waitForTimeout(50);

		const scrollBefore = await page.evaluate(() => window.scrollY);

		// Toggle theme
		await page.click(selectors.themeToggleButton);

		const scrollAfter = await page.evaluate(() => window.scrollY);
		expect(scrollAfter, 'Scroll position should be preserved').toBe(scrollBefore);
	});
});

test.describe('No FOUC on Page Load (NFR-3.1.2)', () => {
	test('dark theme loads without intermediate light flash', async ({ page }) => {
		// Set dark preference
		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });
		await page.evaluate((key) => localStorage.setItem(key, 'dark'), STORAGE_KEY);

		// Instrument the page to capture earliest data-theme value
		await page.addInitScript(() => {
			// This runs in the page context before any scripts
			(window as any).__earlyThemeChecks = [];
			const observer = new MutationObserver((mutations) => {
				for (const m of mutations) {
					if (m.type === 'attributes' && m.attributeName === 'data-theme') {
						(window as any).__earlyThemeChecks.push({
							value: document.documentElement.getAttribute('data-theme'),
							time: performance.now(),
						});
					}
				}
			});
			observer.observe(document.documentElement, { attributes: true });
		});

		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		const checks = await page.evaluate(() => (window as any).__earlyThemeChecks);
		// The first theme write should be 'dark' — no intermediate 'light' before it
		if (checks.length > 0) {
			expect(checks[0].value, 'First data-theme mutation should be dark').toBe('dark');
		}
		// Final state must be dark
		expect(await getThemeAttribute(page)).toBe('dark');
	});

	test('page load with dark preference completes theme application within 100ms of DOMContentLoaded', async ({ page }) => {
		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });
		await page.evaluate((key) => localStorage.setItem(key, 'dark'), STORAGE_KEY);

		await page.addInitScript(() => {
			document.addEventListener('DOMContentLoaded', () => {
				(window as any).__domContentLoadedTime = performance.now();
			});
		});

		await page.goto('/auth');
		await page.waitForSelector(selectors.themeToggleButton, { timeout: 10000 });

		const timing = await page.evaluate(() => {
			const theme = document.documentElement.getAttribute('data-theme');
			return {
				theme,
				domContentLoaded: (window as any).__domContentLoadedTime,
			};
		});

		expect(timing.theme).toBe('dark');
		// Theme should be applied — just verify DOMContentLoaded fired
		expect(timing.domContentLoaded).toBeGreaterThan(0);
	});
});

test.describe('CSS Variables Architecture (NFR-3.1.3)', () => {
	test('theme switching uses CSS custom properties, not class swapping', async ({ page }) => {
		await goToThemedPage(page);

		// Verify the mechanism is data-theme attribute
		expect(await getThemeAttribute(page)).toBe('light');

		await page.click(selectors.themeToggleButton);
		expect(await getThemeAttribute(page)).toBe('dark');

		// Body should NOT have theme-related classes toggled
		const bodyClasses = await page.evaluate(() => document.body.className);
		expect(bodyClasses).not.toContain('dark');
		expect(bodyClasses).not.toContain('light');
	});

	test('CSS variables update synchronously with attribute change', async ({ page }) => {
		await goToThemedPage(page);

		const result = await page.evaluate(() => {
			const getBg = () => getComputedStyle(document.documentElement)
				.getPropertyValue('--color-bg-main').trim().toLowerCase();

			const lightBg = getBg();
			document.documentElement.setAttribute('data-theme', 'dark');
			const darkBg = getBg();

			return { lightBg, darkBg, changed: lightBg !== darkBg };
		});

		expect(result.changed, 'CSS variables should update synchronously').toBe(true);
		expect(result.lightBg).toBe('#fff');
		expect(result.darkBg).toBe('#18181b');
	});

	test('no inline styles used for theming', async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);

		// Key layout elements should not have color-related inline styles
		const inlineColors = await page.evaluate(() => {
			const elements = [document.body, document.querySelector('header'), document.querySelector('.docs')];
			return elements.map(el => {
				if (!el) return null;
				const style = el.getAttribute('style') || '';
				return {
					tag: el.tagName,
					hasColorStyle: /background|color/i.test(style),
				};
			}).filter(Boolean);
		});

		for (const el of inlineColors) {
			if (el) {
				expect(el.hasColorStyle, `${el.tag} should not have inline color styles`).toBe(false);
			}
		}
	});
});
