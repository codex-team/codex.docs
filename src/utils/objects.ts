/**
 * Merge to objects recursively
 *
 * @param {object} target
 * @param {object[]} sources
 * @returns {object}
 */

/**
 * @param target
 * @param {...any} sources
 */
function deepMerge(target: any, ...sources: any[]): object {
  const isObject = (item: any): boolean => item && typeof item === 'object' && !Array.isArray(item);

  if (!sources.length) {
    return target;
  }
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }

        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

export default deepMerge;
