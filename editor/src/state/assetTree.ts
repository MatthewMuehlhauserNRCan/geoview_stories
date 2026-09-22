/** Applies a synchronous string transform to every string value found anywhere in a plain
 * JSON-like tree (arrays/objects/primitives) - shared by the export (asset: -> assets/filename)
 * and import (assets/filename -> asset:) rewrites, which are mirror images of the same walk. */
export const mapStrings = <T,>(value: T, mapper: (s: string) => string): T => {
  if (typeof value === 'string') return mapper(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, mapper)) as unknown as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, mapStrings(v, mapper)])) as T;
  }
  return value;
};

/** Same as `mapStrings`, but for an async mapper (e.g. one that has to read a matching zip entry). */
export const mapStringsAsync = async <T,>(value: T, mapper: (s: string) => Promise<string>): Promise<T> => {
  if (typeof value === 'string') return (await mapper(value)) as unknown as T;
  if (Array.isArray(value)) return (await Promise.all(value.map((v) => mapStringsAsync(v, mapper)))) as unknown as T;
  if (value && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value as Record<string, unknown>).map(async ([k, v]) => [k, await mapStringsAsync(v, mapper)] as const)
    );
    return Object.fromEntries(entries) as T;
  }
  return value;
};
