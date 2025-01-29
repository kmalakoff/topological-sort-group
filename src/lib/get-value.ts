/*!
 * get-value <https://github.com/jonschlinkert/get-value>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT License.
 */

export interface Options {
  default?: unknown;
  separator?: string;
  joinChar?: string;
  join?: (segs: string[]) => string; // eslint-disable-line
  split?: (path: string) => string[]; // eslint-disable-line
  isValid?: (key: string, target: object) => boolean; // eslint-disable-line
}

const isObject = (v) => v !== null && typeof v === 'object';

const join = (segs: string[], joinChar: string, options: Options): string => {
  if (typeof options.join === 'function') {
    return options.join(segs);
  }
  return segs[0] + joinChar + segs[1];
};

const split = (path: string, splitChar: string, options: Options): string[] => {
  if (typeof options.split === 'function') {
    return options.split(path);
  }

  return path.split(splitChar);
};

const isValid = (key: string, target: object, options: Options): boolean => {
  if (typeof options?.isValid === 'function') {
    return options.isValid(key, target);
  }

  return true;
};

const isValidObject = (v: unknown): boolean => {
  return isObject(v) || typeof v === 'function';
};

// eslint-disable-next-line complexity
const getValue = (target: object, path: string | number | string[], options: Options = {}): unknown => {
  if (!isObject(options)) {
    options = { default: options };
  }

  if (!isValidObject(target)) {
    return typeof options.default !== 'undefined' ? options.default : target;
  }

  if (typeof path === 'number') {
    path = String(path);
  }

  const pathIsArray = Array.isArray(path);
  const pathIsString = typeof path === 'string';
  const splitChar = options.separator || '.';
  const joinChar = options.joinChar || (typeof splitChar === 'string' ? splitChar : '.');

  if (!pathIsString && !pathIsArray) {
    return target;
  }

  if (target[path as string] !== undefined) {
    return isValid(path as string, target, options) ? target[path as string] : options.default;
  }

  const segs = pathIsArray ? path : split(path as string, splitChar, options);
  const len = segs.length;
  let idx = 0;

  do {
    let prop = segs[idx];
    if (typeof prop !== 'string') {
      prop = String(prop);
    }

    while (prop && prop.slice(-1) === '\\') {
      prop = join([prop.slice(0, -1), segs[++idx] || ''], joinChar, options);
    }

    if (target[prop] !== undefined) {
      if (!isValid(prop, target, options)) {
        return options.default;
      }

      target = target[prop];
    } else {
      let hasProp = false;
      let n = idx + 1;

      while (n < len) {
        prop = join([prop, segs[n++]], joinChar, options);

        // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
        if ((hasProp = target[prop] !== undefined)) {
          if (!isValid(prop, target, options)) {
            return options.default;
          }

          target = target[prop];
          idx = n - 1;
          break;
        }
      }

      if (!hasProp) {
        return options.default;
      }
    }
  } while (++idx < len && isValidObject(target));

  if (idx === len) {
    return target;
  }

  return options.default;
};

export default getValue;
