/**
 * Simple object check. From https://stackoverflow.com/a/34749873/5625612.
 */
export function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects. From https://stackoverflow.com/a/34749873/5625612.
 */
export function mergeDeep(target: { [key: string]: any }, ...sources: any[]): { [key: string]: any } {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
