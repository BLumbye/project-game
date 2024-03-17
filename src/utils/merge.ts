/**
 * Simple object check. From https://stackoverflow.com/a/34749873/5625612.
 */
type IsObject<T> = T extends object ? (T extends unknown[] ? false : true) : false;

function isObject<T>(v: T): IsObject<T> {
  return (typeof v === 'object' && !Array.isArray(v)) as IsObject<T>;
}

/**
 * Deep merge two objects. From https://stackoverflow.com/a/34749873/5625612.
 */

type Merge2<T, U> = IsObject<T> & IsObject<U> extends true
  ? {
      [K in keyof T]: K extends keyof U ? Merge2<T[K], U[K]> : T[K];
    } & U
  : U;

function merge2<T, U>(a: T, b: U): Merge2<T, U> {
  return (
    isObject(a) && isObject(b)
      ? Object.assign(
          {},
          a,
          Object.fromEntries(Object.entries(b as never).map(([k, v]) => [k, merge2((a as never)[k], v)])),
        )
      : b
  ) as Merge2<T, U>;
}

export type Merge<T extends unknown[]> = {
  0: T[0];
  1: T extends [infer Car, ...infer Cdr] ? Merge2<Car, Merge<Cdr>> : T;
}[T extends [unknown, unknown, ...unknown[]] ? 1 : 0];

export function mergeDeep<T extends unknown[]>(...objs: T): Merge<T> {
  if (objs.length < 2) return objs[0];
  return merge2(objs[0], mergeDeep(...objs.slice(1)));
}
