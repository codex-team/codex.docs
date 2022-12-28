import { loadConfig } from '@codex-team/config-loader';
import * as process from 'process';
import arg from 'arg';
import path from 'path';
import { z } from 'zod';

/**
 * Configuration for Hawk errors catcher
 */
const HawkConfig = z.object({
  backendToken: z.string().optional(), // Hawk backend token
  frontendToken: z.string().optional(), // Hawk frontend token
});

/**
 * Config for local uploads driver
 */
const LocalUploadsConfig = z.object({
  driver: z.literal('local'),
  local: z.object({
    path: z.string(), // path to the database directory
  }),
});

/**
 * Config for S3 uploads driver
 */
const S3UploadsConfig = z.object({
  driver: z.literal('s3'),
  s3: z.object({
    bucket: z.string(),
    region: z.string(),
    baseUrl: z.string(),
    keyPrefix: z.string(),
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
  }),
});

export type LocalUploadsConfig = z.infer<typeof LocalUploadsConfig>;
export type S3UploadsConfig = z.infer<typeof S3UploadsConfig>;

/**
 * Config for local database driver
 */
const LocalDatabaseConfig = z.object({
  driver: z.literal('local'),
  local: z.object({
    path: z.string(), // path to the database directory
  }),
});

/**
 * Config for MongoDB database driver
 */
const MongoDatabaseConfig = z.object({
  driver: z.literal('mongodb'),
  mongodb: z.object({
    uri: z.string(), // MongoDB connection URI
  }),
});

/**
 * Config for authentication
 */
const AuthConfig = z.object({
  secret: z.string(), // Secret for JWT
  password: z.string(), // Password for admin panel
});

/**
 * Frontend configuration
 */
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
  menu: z.array(z.union([z.string(), z.object({ title: z.string(),
    uri: z.string() })])), // Menu for pages
});

/**
 * Static build configuration
 */
const StaticBuildConfig = z.object({
  outputDir: z.string(), // Output directory for static build
  overwrite: z.boolean().optional() // Overwrite output directory
    .default(true),
  pagesInsideFolders: z.boolean().optional() // Create separate folder for each page
    .default(true),
  indexPage: z.object({
    enabled: z.boolean(), // Is index page enabled
    uri: z.string(), // Index page uri
  }),
});

export type StaticBuildConfig = z.infer<typeof StaticBuildConfig>;

/**
 * Application configuration
 */
const AppConfig = z.object({
  port: z.number(), // Port to listen on
  host: z.string(), // Host to listen on
  favicon: z.string().optional(), // Path or URL to favicon
  uploads: z.union([LocalUploadsConfig, S3UploadsConfig]), // Uploads configuration
  hawk: HawkConfig.optional().nullable(), // Hawk configuration
  frontend: FrontendConfig, // Frontend configuration
  auth: AuthConfig, // Auth configuration
  database: z.union([LocalDatabaseConfig, MongoDatabaseConfig]), // Database configuration
  staticBuild: StaticBuildConfig.optional(), // Static build configuration
});

export type AppConfig = z.infer<typeof AppConfig>;

const defaultConfig: AppConfig = {
  'port': 3000,
  'host': 'localhost',
  'uploads': {
    'driver': 'local',
    'local': {
      'path': './uploads',
    },
  },
  'frontend': {
    'title': 'CodeX Docs',
    'description': 'Free Docs app powered by Editor.js ecosystem',
    'startPage': '',
    'carbon': {
      'serve': '',
      'placement': '',
    },
    'menu': [],
  },
  'auth': {
    'secret': 'supersecret',
    'password': 'secretpassword',
  },
  'hawk': null,
  'database': {
    'driver': 'local',
    'local': {
      'path': './db',
    },
  },
};

const args = arg({ /* eslint-disable @typescript-eslint/naming-convention */
  '--config': [ String ],
  '-c': '--config',
});

const cwd = process.cwd();
const paths = (args['--config'] || [ './docs-config.yaml' ]).map((configPath) => {
  if (path.isAbsolute(configPath)) {
    return configPath;
  }

  return path.join(cwd, configPath);
});

const loadedConfig = loadConfig(...[defaultConfig, ...paths]);

const appConfig = AppConfig.parse(loadedConfig);

export default appConfig;
