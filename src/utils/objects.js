/**
 * Merge to objects recursively
 * @param {object} target
 * @param {objects[]} sources
 * @return {object}
 */
function deepMerge(target, ...sources) {
  const isObject = item => item && typeof item === 'object' && !Array.isArray(item);

  if (!sources.length) return target;
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

module.exports = {
  deepMerge
};
