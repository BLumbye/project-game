/**
 * Inverts any given predicate, e.g. `not(isEmpty())` matches any element that is not empty.
 * @param predicate The predicate to invert.
 */
export const not = (predicate: (element: any) => boolean) => (element: any) => !predicate(element);

/**
 * Combines multiple predicates with an AND operator, e.g. `and(isTypeMatch(0), not(isEqual(5)))` matches any element that is a number, except for the number 5.
 * @param predicates The predicates to combine.
 */
export const and = (...predicates: ((element: any) => boolean)[]) => (element: any) => predicates.every((predicate) => predicate(element));

/**
 * Combines multiple predicates with an OR operator, e.g. `or(isTypeMatch(0), isTypeMatch(''))` matches any element that is a number or a string.
 * @param predicates The predicates to combine.
 */
export const or = (...predicates: ((element: any) => boolean)[]) => (element: any) => predicates.some((predicate) => predicate(element));

/**
 * A predicate that sees if an element is empty. To be used together with array functions, such as `count` or `filter` or validation.
 */
export const isEmpty = () => (element: any) => {
  return element === null || element === undefined || element === '';
};

/**
 * A predicate that sees if an element is an exact match. To be used together with array functions, such as `count` or `filter` or validation.
 * @param value The value to match against.
 */
export const isEqual = (value: any) => (element: any) => {
  return element === value;
};

/**
 * A predicate that sees if an elements type is the same as another. To be used together with array functions, such as `count` or `filter` or validation.
 * @param value The value to match against.
 */
export const isTypeMatch = (value: any) => (element: any) => {
  return typeof element === typeof value;
};

/**
 * A predicate that sees if the length of a string or array matches a given number. To be used together with array functions, such as `count` or `filter` or validation.
 * @param length The length to match.
 */
export const isLengthEqualTo = (length: number) => (element: string | any[]) => {
  return element.length === length;
}

/**
 * A predicate that sees if the length of a string or array is less than a given number. To be used together with array functions, such as `count` or `filter` or validation.
 * @param length The length to match.
 */
export const isLengthLessThan = (length: number) => (element: string | any[]) => {
  return element.length < length;
}

/**
 * A predicate that sees if the length of a string or array is less than or equal to a given number. To be used together with array functions, such as `count` or `filter` or validation.
 * @param length The length to match.
 */
export const isLengthLessThanOrEqualTo = (length: number) => (element: string | any[]) => {
  return element.length <= length;
}

/**
 * A predicate that sees if the length of a string or array is greater than a given number. To be used together with array functions, such as `count` or `filter` or validation.
 * @param length The length to match.
 */
export const isLengthGreaterThan = (length: number) => (element: string | any[]) => {
  return element.length > length;
}

/**
 * A predicate that sees if the length of a string or array is greater than or equal to a given number. To be used together with array functions, such as `count` or `filter` or validation.
 * @param length The length to match.
 */
export const isLengthGreaterThanOrEqualTo = (length: number) => (element: string | any[]) => {
  return element.length >= length;
}

/**
 * A predicate that sees if the length of a string or array is between two given numbers (both inclusive). To be used together with array functions, such as `count` or `filter` or validation.
 * @param min The minimum length to match (inclusive).
 * @param max The maximum length to match (inclusive).
 */
export const isLengthBetween = (min: number, max: number) => (element: string | any[]) => {
  return element.length >= min && element.length <= max;
}

/**
 * A predicate that sees if the length of a string or array is between two given numbers (both exclusive). To be used together with array functions, such as `count` or `filter` or validation.
 * @param min The minimum length to match (exclusive).
 * @param max The maximum length to match (exclusive).
 */
export const isLengthBetweenExclusive = (min: number, max: number) => (element: string | any[]) => {
  return element.length > min && element.length < max;
}

/**
 * A predicate that sees if the length of a string or array is between a given number (inclusive) and another given number (exclusive). To be used together with array functions, such as `count` or `filter` or validation.
 * @param min The minimum length to match (inclusive).
 * @param max The maximum length to match (exclusive).
 */
export const isLengthBetweenInclusiveExclusive = (min: number, max: number) => (element: string | any[]) => {
  return element.length >= min && element.length < max;
}

/**
 * A predicate that sees if the length of a string or array is between a given number (exclusive) and another given number (inclusive). To be used together with array functions, such as `count` or `filter` or validation.
 * @param min The minimum length to match (exclusive).
 * @param max The maximum length to match (inclusive).
 */
export const isLengthBetweenExclusiveInclusive = (min: number, max: number) => (element: string | any[]) => {
  return element.length > min && element.length <= max;
}