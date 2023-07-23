/**
 * Parses the element to a number and gives that to the predicate.
 * @param predicate The predicate to match.
 */
export const asNumber = (predicate: (element: number) => boolean) => (element: string) => predicate(Number(element));