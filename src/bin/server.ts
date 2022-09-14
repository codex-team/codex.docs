/**
 * Module dependencies.
 */
import app from '../backend/app.js';
import http from 'http';
import config from 'config';
import Debug from 'debug';

const debug = Debug.debug('codex.editor.docs:server');

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(config.get('port') || '3000');

app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 * @param val
 */
function normalizePort(val: string): number | string | false {
  const value = parseInt(val, 10);

  if (isNaN(value)) {
    // named pipe
    return val;
  }

  if (value >= 0) {
    // port number
    return value;
  }

  return false;
}

/**
 * Event listener for HTTP server 'error' event.
 * @param error
 */
function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server 'listening' event.
 */
function onListening(): void {
  const addr = server.address();

  if (addr === null) {
    debug('Address not found');
    process.exit(1);
  }

  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;

  debug('Listening on ' + bind);

  drawBanner([
    `CodeX Docs server is running`,
    ``,
    `Main page: http://localhost:${port}`
  ]);
}

/**
 * Draw banner in console with given text lines
 * @param {string[]} lines
 */
function drawBanner(lines: string[]) {
  /** Define banner parts */
  const PARTS = {
    TOP_LEFT: '┌',
    TOP_RIGHT: '┐',
    BOTTOM_LEFT: '└',
    BOTTOM_RIGHT: '┘',
    HORIZONTAL: '─',
    VERTICAL: '│',
    SPACE: ' ',
  }

  /** Calculate max line length */
  const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);

  /** Prepare top line */
  const top = PARTS.TOP_LEFT + PARTS.HORIZONTAL.repeat(maxLength + 2) + PARTS.TOP_RIGHT;

  /** Compose middle lines */
  const middle = lines.map(line => PARTS.VERTICAL + ' ' + line + PARTS.SPACE.repeat(maxLength - line.length) + ' ' + PARTS.VERTICAL);

  /** Prepare bottom line */
  const bottom = PARTS.BOTTOM_LEFT + PARTS.HORIZONTAL.repeat(maxLength + 2) + PARTS.BOTTOM_RIGHT;

  console.log(top);
  console.log(middle.join('\n'));
  console.log(bottom);
}

export default {
  server,
  app,
};
