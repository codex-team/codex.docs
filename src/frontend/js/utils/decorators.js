/**
 * A few useful utility functions
 */
export class Decorators {
  /**
   * Throttle decorator function
   *
   * @param {Function} func - function to throttle
   * @param {number} ms - milliseconds to throttle
   *
   * @returns {wrapper}
   */
  static throttle(func, ms) {
    let isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper() {
      if (isThrottled) {
        savedArgs = arguments;
        savedThis = this;
        return;
      }

      func.apply(this, arguments);

      isThrottled = true;

      setTimeout(function() {
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
  static debounce(f, ms) {
    let isCooldown = false;

    return function () {
      if (isCooldown) return;

      f.apply(this, arguments);

      isCooldown = true;

      setTimeout(() => isCooldown = false, ms);
    };
  }
}
