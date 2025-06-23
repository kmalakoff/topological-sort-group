import get from './deepGet.ts';
import type { GraphOptions, Key, Node } from './types.ts';

const isArray = Array.isArray || ((x) => Object.prototype.toString.call(x) === '[object Array]');

export default class Graph<T> {
  private nodeMap: Record<Key, Node<T>>;
  private path: string | undefined;

  constructor(options?: GraphOptions) {
    this.path = options ? options.path || undefined : undefined;
    this.nodeMap = {};
  }

  static from<T>(values: Array<Key | T | [Key | T, Key | T]>, options?: GraphOptions): Graph<T> {
    const graph = new Graph<T>(options);
    values.forEach((value) => (isArray(value) ? graph.add(value[0], value[1]) : graph.add(value as T)));
    return graph;
  }

  key(keyOrValue: Key | T): Key {
    if (this.path) return typeof keyOrValue === 'object' ? (get(keyOrValue, this.path) as Key) : (keyOrValue as Key);
    return keyOrValue as Key;
  }

  keys(): Key[] {
    const keys = [];
    for (const key in this.nodeMap) keys.push(key);
    return keys;
  }

  value(key: Key): T {
    return this.nodeMap[key].value;
  }

  edges(key: Key): Key[] {
    return this.nodeMap[key].edges;
  }

  add(keyOrValue: Key | T, toKeyOrValue?: Key | T) {
    const key = this.key(keyOrValue);
    const value = this.path ? (typeof keyOrValue === 'object' ? keyOrValue : undefined) : (keyOrValue as T);
    if (value !== undefined) {
      if (this.nodeMap[key] === undefined) this.nodeMap[key] = { value: value as T, edges: [] } as Node<T>;
      else if (this.nodeMap[key].value !== value) throw new Error(`Adding different node values to same graph. Key ${key as string}. Existing: ${JSON.stringify(this.nodeMap[key].value)}. New: ${JSON.stringify(value)}`);
    }
    // biome-ignore lint/complexity/noArguments: Apply arguments
    if (arguments.length === 1) return;

    // add edge
    this.add(toKeyOrValue);
    const toKey = this.key(toKeyOrValue);
    this.nodeMap[key].edges.push(toKey);
  }

  degrees(): Record<Key, number> {
    const degrees = {} as Record<Key, number>;
    for (const from in this.nodeMap) {
      if (degrees[from as Key] === undefined) degrees[from as Key] = 0;
      this.nodeMap[from].edges.forEach((key: Key) => {
        if (degrees[key] === undefined) degrees[key] = 0;
        degrees[key]++;
      });
    }
    return degrees;
  }
}
