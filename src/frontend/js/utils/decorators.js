/**
 * A few useful utility functions
 */

/**
 * Throttle decorator function
 *
 * @param {Function} func - function to throttle
 * @param {number} ms - milliseconds to throttle
 *
 * @returns {Function}
 */
export function throttle(func, ms) {
  let isThrottled = false,
      savedArgs,
      savedThis;

  // eslint-disable-next-line jsdoc/require-jsdoc
  function wrapper() {
    if (isThrottled) {
      savedArgs = arguments;
      savedThis = this;

      return;
    }

    func.apply(this, arguments);

    isThrottled = true;

    setTimeout(function () {
      isThrottled = false;

      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, ms);
  }

  return wrapper;
}

/**
 * Debounce decorator function
 *
 * @param {Function} f - function to debounce
 * @param {number} ms - milliseconds to debounce
 *
 * @returns {(function(): void)|*}
 */
export function debounce(f, ms) {
  let timeoutId = null;

  return function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => f.apply(this, arguments), ms);
  };
}
