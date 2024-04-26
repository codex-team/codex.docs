import path from 'path';
import fs from 'fs/promises';
import fetch, { RequestInit } from 'node-fetch';

/**
 * Uploaded favicon data
 */
export interface FaviconData {
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
 * @param faviconFolder - folder to save favicon
 * @param subRoute - subroute from which the favicon will be served
 * @returns { Promise<FaviconData> } - Promise with data about favicon
 */
export async function downloadFavicon(destination: string, faviconFolder: string, subRoute = '/favicon'): Promise<FaviconData> {
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
    await fs.copyFile(destination, path.join(faviconFolder, filename));

    return  {
      destination: `${subRoute}/${filename}`,
      type: `image/${format}`,
    } as FaviconData;
  }

  // Create timeout to abort request
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.log('Favicon request has timed out.');
  }, 5000);

  // Make get request to url
  const res = await fetch(destination, { signal: controller.signal as RequestInit['signal'] });
  // Get buffer data from response
  const fileData = await res.buffer();

  // Clear timeout, if data was got
  clearTimeout(timeoutId);

  // Get file path in temporary directory
  const filePath = path.join(faviconFolder, `favicon.${format}`);

  // Save file
  await fs.writeFile(filePath, fileData);

  return {
    destination: `${subRoute}/favicon.${format}`,
    type: `image/${format}`,
  } as FaviconData;
}
