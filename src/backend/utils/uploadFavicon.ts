import { get } from 'https';

// Create empty buffer for file
let file: Buffer = Buffer.alloc(0);

/**
 * Upload favicon by url
 *
 * @param url - url for uploading favicon
 * @returns { Promise<Buffer> } - Promise with whole file data
 */
export default function uploadFavicon(url: string): Promise<Buffer> {
  return new Promise(function (resolve, reject) {
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
}
