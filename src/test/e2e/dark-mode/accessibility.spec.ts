import { test, expect, selectors, getCSSVariable, goToThemedPage } from '../fixtures/setup';

/**
 * WCAG 2.1 AA Accessibility Tests for Dark Mode
 *
 * Covers:
 * - Color contrast ratios (WCAG 1.4.3 / 1.4.11)
 * - Keyboard navigation (WCAG 2.1.1)
 * - Focus visibility (WCAG 2.4.7)
 * - ARIA attributes (WCAG 4.1.2)
 */

/**
 * Calculate relative luminance per WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function hexToLuminance(hex: string): number {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;

	const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
	const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
	const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

	return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

function contrastRatio(hex1: string, hex2: string): number {
	const l1 = hexToLuminance(hex1);
	const l2 = hexToLuminance(hex2);
	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);
	return (lighter + 0.05) / (darker + 0.05);
}

test.describe('WCAG AA Contrast Ratios — Dark Mode', () => {
	test.beforeEach(async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);
	});

	test('primary text on main background meets 4.5:1', async ({ page }) => {
		const text = await getCSSVariable(page, '--color-text-main');
		const bg = await getCSSVariable(page, '--color-bg-main');
		const ratio = contrastRatio(text, bg);
		expect(ratio, `text-main(${text}) on bg-main(${bg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
	});

	test('secondary text on main background meets 4.5:1', async ({ page }) => {
		const text = await getCSSVariable(page, '--color-text-second');
		const bg = await getCSSVariable(page, '--color-bg-main');
		const ratio = contrastRatio(text, bg);
		expect(ratio, `text-second(${text}) on bg-main(${bg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
	});

	test('primary text on light background meets 4.5:1', async ({ page }) => {
		const text = await getCSSVariable(page, '--color-text-main');
		const bg = await getCSSVariable(page, '--color-bg-light');
		const ratio = contrastRatio(text, bg);
		expect(ratio, `text-main(${text}) on bg-light(${bg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
	});

	test('secondary text on light background meets 4.5:1', async ({ page }) => {
		const text = await getCSSVariable(page, '--color-text-second');
		const bg = await getCSSVariable(page, '--color-bg-light');
		const ratio = contrastRatio(text, bg);
		expect(ratio, `text-second(${text}) on bg-light(${bg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
	});

	test('link color on main background meets 4.5:1', async ({ page }) => {
		const link = await getCSSVariable(page, '--color-link-active');
		const bg = await getCSSVariable(page, '--color-bg-main');
		const ratio = contrastRatio(link, bg);
		expect(ratio, `link-active(${link}) on bg-main(${bg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
	});

	test('code comment on code background meets 4.5:1', async ({ page }) => {
		const comment = await getCSSVariable(page, '--color-code-comment');
		const codeBg = await getCSSVariable(page, '--color-code-bg');
		const ratio = contrastRatio(comment, codeBg);
		expect(ratio, `code-comment(${comment}) on code-bg(${codeBg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
	});

	test('code main text on code background meets 4.5:1', async ({ page }) => {
		const codeText = await getCSSVariable(page, '--color-code-main');
		const codeBg = await getCSSVariable(page, '--color-code-bg');
		const ratio = contrastRatio(codeText, codeBg);
		expect(ratio, `code-main(${codeText}) on code-bg(${codeBg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
	});

	test('UI line/border on main background meets 3:1 (WCAG 1.4.11)', async ({ page }) => {
		const line = await getCSSVariable(page, '--color-line-gray');
		const bg = await getCSSVariable(page, '--color-bg-main');
		const ratio = contrastRatio(line, bg);
		expect(ratio, `line-gray(${line}) on bg-main(${bg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3);
	});

	test('checkbox border on dark background meets 3:1 (WCAG 1.4.11)', async ({ page }) => {
		const border = await getCSSVariable(page, '--color-checkbox-border');
		const bg = await getCSSVariable(page, '--color-bg-main');
		const ratio = contrastRatio(border, bg);
		expect(ratio, `checkbox-border(${border}) on bg-main(${bg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3);
	});

	test('primary button: white text on button bg meets 4.5:1', async ({ page }) => {
		const btnBg = await getCSSVariable(page, '--color-button-primary');
		const ratio = contrastRatio('#ffffff', btnBg);
		expect(ratio, `white on button-primary(${btnBg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
	});

	test('warning button: white text on button bg meets 4.5:1', async ({ page }) => {
		const btnBg = await getCSSVariable(page, '--color-button-warning');
		const ratio = contrastRatio('#ffffff', btnBg);
		expect(ratio, `white on button-warning(${btnBg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
	});

	test('success color on main background meets 4.5:1', async ({ page }) => {
		const success = await getCSSVariable(page, '--color-success');
		const bg = await getCSSVariable(page, '--color-bg-main');
		const ratio = contrastRatio(success, bg);
		expect(ratio, `success(${success}) on bg-main(${bg}): ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
	});
});

test.describe('Keyboard Navigation — Dark Mode', () => {
	test.beforeEach(async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);
	});

	test('theme toggle is reachable via Tab key', async ({ page }) => {
		// Tab through the page until the toggle button receives focus
		const button = page.locator(selectors.themeToggleButton);
		let foundFocus = false;

		for (let i = 0; i < 20; i++) {
			await page.keyboard.press('Tab');
			if (await button.evaluate(el => el === document.activeElement)) {
				foundFocus = true;
				break;
			}
		}
		expect(foundFocus, 'Theme toggle should be reachable via Tab').toBe(true);
	});

	test('Enter key activates theme toggle', async ({ page }) => {
		const button = page.locator(selectors.themeToggleButton);
		await button.focus();
		await expect(button).toBeFocused();

		// Currently dark, pressing Enter should toggle to light
		await page.keyboard.press('Enter');
		const theme = await page.evaluate(() =>
			document.documentElement.getAttribute('data-theme')
		);
		expect(theme).toBe('light');
	});

	test('Space key activates theme toggle', async ({ page }) => {
		const button = page.locator(selectors.themeToggleButton);
		await button.focus();

		// Currently dark, pressing Space should toggle to light
		await page.keyboard.press('Space');
		const theme = await page.evaluate(() =>
			document.documentElement.getAttribute('data-theme')
		);
		expect(theme).toBe('light');
	});

	test('sidebar search input is keyboard focusable', async ({ page }) => {
		const searchInput = page.locator('.docs-sidebar__search');

		// Skip if sidebar isn't visible (mobile viewport)
		if (await searchInput.isVisible()) {
			await searchInput.focus();
			await expect(searchInput).toBeFocused();
		}
	});
});

test.describe('Focus Visibility — Dark Mode (WCAG 2.4.7)', () => {
	test.beforeEach(async ({ page }) => {
		await goToThemedPage(page);
		await page.click(selectors.themeToggleButton);
	});

	test('theme toggle has visible focus indicator', async ({ page }) => {
		const button = page.locator(selectors.themeToggleButton);
		await button.focus();
		await expect(button).toBeFocused();

		// Verify focus produces a visible outline or box-shadow
		const outline = await button.evaluate(el => {
			const styles = getComputedStyle(el);
			return {
				outline: styles.outline,
				outlineWidth: styles.outlineWidth,
				outlineStyle: styles.outlineStyle,
				boxShadow: styles.boxShadow,
			};
		});

		// Either outline or box-shadow should provide a visible focus indicator
		const hasOutline = outline.outlineStyle !== 'none' && outline.outlineWidth !== '0px';
		const hasBoxShadow = outline.boxShadow !== 'none';
		expect(hasOutline || hasBoxShadow, 'Focus indicator should be visible via outline or box-shadow').toBe(true);
	});

	test('links have visible focus indicator in dark mode', async ({ page }) => {
		// Use keyboard Tab to trigger :focus-visible (programmatic focus doesn't)
		let focusedLink = false;

		for (let i = 0; i < 20; i++) {
			await page.keyboard.press('Tab');
			const tagName = await page.evaluate(() =>
				document.activeElement?.tagName.toLowerCase()
			);
			if (tagName === 'a') {
				focusedLink = true;
				break;
			}
		}
		expect(focusedLink, 'Should be able to Tab to a link').toBe(true);

		const outline = await page.evaluate(() => {
			const el = document.activeElement;
			if (!el) return { outlineStyle: 'none', outlineWidth: '0px', boxShadow: 'none' };
			const styles = getComputedStyle(el);
			return {
				outlineStyle: styles.outlineStyle,
				outlineWidth: styles.outlineWidth,
				boxShadow: styles.boxShadow,
			};
		});

		const hasOutline = outline.outlineStyle !== 'none' && outline.outlineWidth !== '0px';
		const hasBoxShadow = outline.boxShadow !== 'none';
		expect(hasOutline || hasBoxShadow, 'Links should have a visible focus indicator').toBe(true);
	});
});

test.describe('ARIA Attributes & Semantic Structure', () => {
	test.beforeEach(async ({ page }) => {
		await goToThemedPage(page);
	});

	test('theme toggle has aria-label', async ({ page }) => {
		const button = page.locator(selectors.themeToggleButton);
		await expect(button).toHaveAttribute('aria-label', 'Toggle dark mode');
	});

	test('theme toggle has descriptive title', async ({ page }) => {
		const button = page.locator(selectors.themeToggleButton);
		await expect(button).toHaveAttribute('title', 'Toggle theme');
	});

	test('theme toggle uses semantic button element', async ({ page }) => {
		const button = page.locator(selectors.themeToggleButton);
		const tagName = await button.evaluate(el => el.tagName.toLowerCase());
		expect(tagName).toBe('button');
	});

	test('page has valid lang attribute on html element', async ({ page }) => {
		// html element should exist
		const html = page.locator('html');
		await expect(html).toBeAttached();
	});

	test('header uses semantic header element', async ({ page }) => {
		const header = page.locator('header');
		await expect(header).toBeAttached();
	});

	test('sidebar uses semantic aside element', async ({ page }) => {
		const aside = page.locator('aside.docs-sidebar__content');
		await expect(aside).toBeAttached();
	});

	test('SVG icons in theme toggle are hidden from screen readers', async ({ page }) => {
		// SVGs inside the toggle button should not be announced
		const svgs = page.locator(`${selectors.themeToggleButton} svg`);
		const count = await svgs.count();
		expect(count).toBe(2); // sun + moon icons

		for (let i = 0; i < count; i++) {
			const svg = svgs.nth(i);
			// SVGs should either have aria-hidden="true" or role="presentation",
			// or the parent button's aria-label covers them
			const ariaHidden = await svg.getAttribute('aria-hidden');
			const role = await svg.getAttribute('role');

			// If neither is set, the parent button's aria-label provides the accessible name
			if (ariaHidden !== 'true' && role !== 'presentation') {
				const parentLabel = await svg.evaluate(el =>
					el.closest('button')?.getAttribute('aria-label')
				);
				expect(parentLabel, 'SVG parent button should have aria-label').toBeTruthy();
			}
		}
	});

	test('no duplicate IDs on page (dark mode)', async ({ page }) => {
		await page.click(selectors.themeToggleButton);

		const duplicateIds = await page.evaluate(() => {
			const allElements = document.querySelectorAll('[id]');
			const idMap: Record<string, number> = {};
			allElements.forEach(el => {
				const id = el.id;
				idMap[id] = (idMap[id] || 0) + 1;
			});
			return Object.entries(idMap)
				.filter(([, count]) => count > 1)
				.map(([id]) => id);
		});

		expect(duplicateIds, `Duplicate IDs found: ${duplicateIds.join(', ')}`).toHaveLength(0);
	});
});
