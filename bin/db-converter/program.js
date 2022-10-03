import { Command } from 'commander';

const program = new Command();

program
  .name('db-converter')
  .description('Converts data from local database to MongoDB')
  .option('--db-path <path>', 'Path to the local database', './db')
  .option('--mongodb-uri <uri>', 'URI to the MongoDB database', 'mongodb://localhost:27017/docs')
  .parse();

const options = program.opts();

export { options };
