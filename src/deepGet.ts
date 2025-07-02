// https://gist.github.com/andrewchilds/30a7fb18981d413260c7a36428ed13da

type GetReturnType<T> = T | undefined;
type ValueType = Record<string | number, unknown>;

const isArray = Array.isArray || ((x) => Object.prototype.toString.call(x) === '[object Array]');

export default function deepGet<T>(value: unknown, query: string | string[] | number[], defaultVal: GetReturnType<T> = undefined): GetReturnType<T> {
  const splitQuery = isArray(query)
    ? query
    : (query as string)
        .replace(/(\[(\d)\])/g, '.$2')
        .replace(/^\./, '')
        .split('.');

  if (!splitQuery.length || splitQuery[0] === undefined) return value as T;

  const key = splitQuery[0];

  if (typeof value !== 'object' || value === null || !(key in value) || (value as ValueType)[key] === undefined) {
    return defaultVal;
  }

  return deepGet((value as ValueType)[key], splitQuery.slice(1), defaultVal);
}
