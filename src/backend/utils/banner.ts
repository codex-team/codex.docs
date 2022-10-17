/**
 * Draw banner in console with given text lines
 *
 * @param lines - data to draw
 */
export function drawBanner(lines: string[]): void {
  /** Define banner parts */
  const PARTS = {
    TOP_LEFT: '┌',
    TOP_RIGHT: '┐',
    BOTTOM_LEFT: '└',
    BOTTOM_RIGHT: '┘',
    HORIZONTAL: '─',
    VERTICAL: '│',
    SPACE: ' ',
  };

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
