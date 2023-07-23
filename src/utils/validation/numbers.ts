/**
 * A predicate that sees if an element is a number. To be used together with array functions, such as `count` or `filter` or validation.
 */
export const isNumber = () => (element: string) => {
  return !isNaN(Number(element)) || element === '-' || element === '.' || element === '-.';
}

/**
 * A predicate that sees if an element is a whole number. To be used together with array functions, such as `count` or `filter` or validation.
 */
export const isWholeNumber = () => (element: string) => {
  return !isNaN(Number(element)) && !element.includes('.');
}

/**
 * A predicate that sees if an element is positive. To be used together with array functions, such as `count` or `filter` or validation.
 */
export const isPositive = () => (element: number) => {
  return (Number(element) || 0) >= 0;
}

/**
 * A predicate that sees if an element is negative. To be used together with array functions, such as `count` or `filter` or validation.
 */
export const isNegative = () => (element: number) => {
  return (Number(element) || 0) <= 0;
}

/**
 * A predicate that sees if an element is strictly positive. To be used together with array functions, such as `count` or `filter` or validation.
 */
export const isStrictlyPositive = () => (element: number) => {
  return (Number(element) || 0) > 0;
}

/**
 * A predicate that sees if an element is strictly negative. To be used together with array functions, such as `count` or `filter` or validation.
 */
export const isStrictlyNegative = () => (element: number) => {
  return (Number(element) || 0) < 0;
}

/**
 * A predicate that sees if a number is less than another number. To be used together with array functions, such as `count` or `filter` or validation.
 * @param value The value to compare against.
 */
export const isLessThan = (value: number) => (element: number) => {
  return (Number(element) || 0) < value;
}

/**
 * A predicate that sees if a number is less than or equal to another number. To be used together with array functions, such as `count` or `filter` or validation.
 * @param value The value to compare against.
 */
export const isLessThanOrEqualTo = (value: number) => (element: number) => {
  return (Number(element) || 0) <= value;
}

/**
 * A predicate that sees if a number is greater than another number. To be used together with array functions, such as `count` or `filter` or validation.
 * @param value The value to compare against.
 */
export const isGreaterThan = (value: number) => (element: number) => {
  return (Number(element) || 0) > value;
}

/**
 * A predicate that sees if a number is greater than or equal to another number. To be used together with array functions, such as `count` or `filter` or validation.
 * @param value The value to compare against.
 */
export const isGreaterThanOrEqualTo = (value: number) => (element: number) => {
  return (Number(element) || 0) >= value;
}

/**
 * A predicate that sees if the number is between two other numbers (both inclusive). To be used together with array functions, such as `count` or `filter` or validation.
 * @param min The minimum value (inclusive).
 * @param max The maximum value (inclusive).
 */
export const isBetween = (min: number, max: number) => (element: number) => {
  return (Number(element) || 0) >= min && (Number(element) || 0) <= max;
}

/**
 * A predicate that sees if the number is between two other numbers (both exclusive). To be used together with array functions, such as `count` or `filter` or validation.
 * @param min The minimum value (exclusive).
 * @param max The maximum value (exclusive).
 */
export const isBetweenExclusive = (min: number, max: number) => (element: number) => {
  return (Number(element) || 0) > min && (Number(element) || 0) < max;
}

/**
 * A predicate that sees if the number is between two other numbers (minimum inclusive, maximum exclusive). To be used together with array functions, such as `count` or `filter` or validation.
 * @param min The minimum value (inclusive).
 * @param max The maximum value (exclusive).
 */
export const isBetweenInclusiveExclusive = (min: number, max: number) => (element: number) => {
  return (Number(element) || 0) >= min && (Number(element) || 0) < max;
}

/**
 * A predicate that sees if the number is between two other numbers (minimum exclusive, maximum inclusive). To be used together with array functions, such as `count` or `filter` or validation.
 * @param min The minimum value (exclusive).
 * @param max The maximum value (inclusive).
 */
export const isBetweenExclusiveInclusive = (min: number, max: number) => (element: number) => {
  return (Number(element) || 0) > min && (Number(element) || 0) <= max;
}