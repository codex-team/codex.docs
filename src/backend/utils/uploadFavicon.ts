import { get } from 'https';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Create empty buffer for file
let file: Buffer = Buffer.alloc(0);

/**
 * Upload favicon by url
 *
 * @param url - url for uploading favicon
 * @returns { Promise<string> } - Promise with path of saved file
 */
export default async function uploadFavicon(url: string): Promise<string> {
  // Create prise of getting file data
  const fileDataPromise = new Promise<Buffer>(function (resolve, reject) {
    const req = get(url, function ( res) {
      // Reject on bad status
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        return reject(new Error('statusCode=' + res.statusCode));
      }
      // Response on incoming data
      res.on('data', (chunk) => {
        file = Buffer.concat([file, chunk]);
      });
      res.on('end', function () {
        resolve(file);
      });
    });

    // Reject on request error
    req.on('error', function (err) {
      reject(err);
    });
    req.end();
  });
  const fileData = await fileDataPromise;

  // Get file name by url
  const filename = url.substring(url.lastIndexOf('/')+1);

  // Get file path in temporary directory
  const filePath = path.join(os.tmpdir(), filename);

  // Save file
  fs.writeFileSync(filePath, fileData);

  return filePath;
}
