const ERROR_MESSAGE = 'Unable to copy to clipboard';

/**
 * Copies specified text to clipboard
 *
 * @param {string} text - text to be copied to clipboard
 * @returns {Promise<void>}
 */
export default function (text) {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => resolve())
        .catch(() => reject(new Error(ERROR_MESSAGE)));
    } else {
      const tmpElement = document.createElement('input');

      Object.assign(tmpElement.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        opacity: '0',
      });

      tmpElement.value = text;
      document.body.appendChild(tmpElement);
      tmpElement.select();

      try {
        document.execCommand('copy');
        resolve();
      } catch (e) {
        reject(new Error(ERROR_MESSAGE));
      } finally {
        document.body.removeChild(tmpElement);
      }
    }
  });
}
