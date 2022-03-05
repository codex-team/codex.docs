/**
 * Merge to objects recursively
 *
 * @param {object} target
 * @param {object[]} sources
 * @returns {object}
 */

/**
 * @param {Record<string, any>} target - target to merge into
 * @param {...any[]} sources - sources to merge from
 */
function deepMerge(target: Record<string, any>, ...sources: any[]): Record<string, unknown> {
  const isObject = (item: unknown): boolean => !!item && typeof item === 'object' && !Array.isArray(item);

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
