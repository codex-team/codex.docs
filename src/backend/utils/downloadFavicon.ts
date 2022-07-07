import path from 'path';
import os from 'os';
import fs from 'fs';
import fetch from 'node-fetch';

/**
 * Uploaded favicon data
 */
interface FaviconData {
  // Uploaded favicon path
  destination: string;

  // File type
  type: string;
}

// Initiate controller for aborting request
const controller = new AbortController();

/**
 * Check if string is url
 *
 * @param  str - string to check
 */
function checkIsUrl(str: string): boolean {
  const re = new RegExp('https?://');

  return re.test(str);
}

/**
 * Upload favicon by url, or get it by path
 *
 * @param destination - url or path of favicon
 * @returns { Promise<FaviconData> } - Promise with data about favicon
 */
export async function downloadFavicon(destination: string): Promise<FaviconData> {
  // Check of destination is empty
  if (!destination) {
    throw Error('Favicon destination is empty');
  }

  // Get file name by destination
  const filename = destination.substring(destination.lastIndexOf('/')+1);

  // Get file format
  const format = filename.split('.')[1];

  // Check if string is url
  if (!checkIsUrl(destination)) {
    return  { destination: destination,
      type: `image/${format}` } as FaviconData;
  }

  // Create timeout to abort request
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.log('Favicon request has timed out.');
  }, 5000);

  // Make get request to url
  const res = await fetch(destination, { signal: controller.signal });
  // Get buffer data from response
  const fileData = await res.buffer();

  // Clear timeout, if data was got
  clearTimeout(timeoutId);

  // Get file path in temporary directory
  const filePath = path.join(os.tmpdir(), `favicon.${format}`);

  // Save file
  await fs.writeFile(filePath, fileData, (err) => {
    if (err) {
      console.log(err);
    }
  });

  return  { destination: `/favicon/favicon.${format}`,
    type: `image/${format}` } as FaviconData;
}
