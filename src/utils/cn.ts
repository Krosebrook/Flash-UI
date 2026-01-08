/**
 * Valid class value types
 */
export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[]
  | Record<string, boolean | undefined | null>;

/**
 * Combines class names conditionally (similar to clsx/classnames)
 * @param inputs - Class values to combine
 * @returns Combined class name string
 *
 * @example
 * cn('foo', 'bar') // => 'foo bar'
 * cn('foo', { bar: true, baz: false }) // => 'foo bar'
 * cn('foo', ['bar', { baz: true }]) // => 'foo bar baz'
 * cn('foo', null, undefined, false, 'bar') // => 'foo bar'
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) {
        classes.push(nested);
      }
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}
