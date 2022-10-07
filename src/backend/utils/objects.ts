export interface Dict {
  [key: string]: any;
}

/**
 * Merge to objects recursively
 *
 * @param {object} target
 * @param {object[]} sources
 * @returns {object}
 */
export function deepMerge(target: Record<string, any>, ...sources: any[]): Record<string, unknown> {
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


/**
 * Map fields of object to result by provided map object
 *
 * @param {File} data - data to map
 * @param {object} map - object that represents how should fields of File object should be mapped to response
 */
export function mapObject(data: Dict, map: Dict): Dict {
  const response: Dict = {};

  Object.entries(map).forEach(([name, path]) => {
    const fields: string[] = path.split(':');

    if (fields.length > 1) {
      let object: Dict = {};
      const result = object;

      fields.forEach((field, i) => {
        if (i === fields.length - 1) {
          object[field] = data[name];

          return;
        }

        object[field] = {};
        object = object[field];
      });

      deepMerge(response, result);
    } else {
      response[fields[0]] = data[name];
    }
  });

  return response;
}
