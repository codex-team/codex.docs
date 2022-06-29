import path from 'path';
import os from 'os';
import fs from 'fs';
import fetch from 'node-fetch';
import config from 'config';

interface FaviconData {
  destination: string;
  type: string;
}

const favicon = config.get<FaviconData>('favicon');

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
 * Upload favicon by url
 *
 * @param url - url for uploading favicon
 * @returns { Promise<string> } - Promise with format of saved file
 */
async function uploadFavicon(url: string): Promise<string> {
  // Check if string is url
  if (!checkIsUrl(url)) {
    return url;
  }
  // Make get request to url
  const res = await fetch(url);
  // Get buffer data from response
  const fileData = await res.buffer();

  // Get file name by url
  const filename = url.substring(url.lastIndexOf('/')+1);

  // Get file format
  const format = filename.split('.')[1];

  // Get file path in temporary directory
  const filePath = path.join(os.tmpdir(), `favicon.${format}`);

  // Save file
  fs.writeFileSync(filePath, fileData);

  return `/favicon/favicon.${format}`;
}
