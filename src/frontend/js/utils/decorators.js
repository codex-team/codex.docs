/**
 * A few useful utility functions
 */
export class Decorators {
  /**
   *
   *
   * @param func
   * @param ms
   * @return {wrapper}
   */
  static throttle(func, ms) {
    let isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper() {
      if (isThrottled) { // (2)
        savedArgs = arguments;
        savedThis = this;
        return;
      }

      func.apply(this, arguments); // (1)

      isThrottled = true;

      setTimeout(function() {
        isThrottled = false; // (3)

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
