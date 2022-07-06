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
 * @param destination - url for uploading favicon
 * @returns { Promise<string> } - Promise with format of saved file
 */
export async function uploadFavicon(destination: string): Promise<FaviconData> {
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
  // Make get request to url
  const res = await fetch(destination);
  // Get buffer data from response
  const fileData = await res.buffer();

  // Get file path in temporary directory
  const filePath = path.join(os.tmpdir(), `favicon.${format}`);

  // Save file
  fs.writeFileSync(filePath, fileData);

  return  { destination: `/favicon/favicon.${format}`,
    type: `image/${format}` } as FaviconData;
}
