import { loadConfig } from 'config-loader';
import * as process from 'process';
import arg from 'arg';
import path from 'path';
import { z } from "zod";

/**
 * Configuration for Hawk errors catcher
 */
const HawkConfig = z.object({
  backendToken: z.string().optional(), // Hawk backend token
  frontendToken: z.string().optional(), // Hawk frontend token
})

const LocalDatabaseConfig = z.object({
  driver: z.literal('local'),
  local: z.object({
    path: z.string()
  })
})

const AuthConfig = z.object({
  secret: z.string() // Secret for JWT
})

const FrontendConfig = z.object({
  title: z.string(), // Title for pages
  description: z.string(), // Description for pages
  startPage: z.string(), // Start page
  misprintsChatId: z.string().optional(), // Telegram chat id for misprints
  yandexMetrikaId: z.string().optional(), // Yandex metrika id
  carbon: z.object({
    serve: z.string().optional(), // Carbon serve url
    placement: z.string().optional(), // Carbon placement
  }),
  menu: z.array(z.union([z.string(), z.object({title: z.string(), uri: z.string()})])), // Menu for pages
})

/**
 * Application configuration
 */
const AppConfig = z.object({
  port: z.number(), // Port to listen on
  host: z.string(), // Host to listen on
  favicon: z.string().optional(), // Path or URL to favicon
  uploads: z.string(), // Path to uploads folder
  hawk: HawkConfig.optional().nullable(), // Hawk configuration
  password: z.string(), // Password for admin panel
  frontend: FrontendConfig, // Frontend configuration
  auth: AuthConfig, // Auth configuration
  database: LocalDatabaseConfig, // Database configuration
})

export type AppConfig = z.infer<typeof AppConfig>;

const args = arg({ /* eslint-disable @typescript-eslint/naming-convention */
  '--config': [ String ],
  '-c': '--config',
});

const cwd = process.cwd();
const paths = (args['--config'] || ['./app-config.yaml']).map((configPath) => {
  if (path.isAbsolute(configPath)) {
    return configPath;
  }

  return path.join(cwd, configPath);
});

const loadedConfig = loadConfig<AppConfig>(...paths);

const appConfig = AppConfig.parse(loadedConfig)

export default appConfig;
