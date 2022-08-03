/**
 * Utility class to handle interaction with local storage
 */
export class Storage {
  /**
   * @param {string} key - storage key
   */
  constructor(key) {
    this.key = key;
  }

  /**
   * Saves value to storage
   *
   * @param {string} value - value to be saved
   */
  set(value) {
    localStorage.setItem(this.key, value);
  }

  /**
   * Retreives value from storage
   *
   * @returns {string}
   */
  get() {
    return localStorage.getItem(this.key);
  }
}
