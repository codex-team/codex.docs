import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:7777',
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: {
		command: 'npx cross-env NODE_ENV=development node --loader ts-node/esm src/backend/app.ts -c docs-config.yaml -c docs-config.local.yaml',
		url: 'http://localhost:7777',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
