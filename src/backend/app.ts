import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import runHttpServer from './server.js';
import buildStatic from './build-static.js';

yargs(hideBin(process.argv))
  .option('config', {
    alias: 'c',
    type: 'string',
    default: './docs-config.yaml',
    description: 'Config files paths',
  })
  .help('h')
  .alias('h', 'help')
  .command('$0', 'start the server', () => {/* empty */}, runHttpServer)
  .command('build-static', 'build files from database', () => {/* empty */}, async () => {
    await buildStatic();
    process.exit(0);
  })
  .parse();
