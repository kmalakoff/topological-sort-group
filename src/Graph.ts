import get from './lodash.get/index.cjs';
import type { Counter, GraphOptions, Key, NodeRecords, Value } from './types';

const isArray = Array.isArray || ((x) => Object.prototype.toString.call(x) === '[object Array]');

export default class Graph<T extends Key> {
  private nodeMap: NodeRecords<T>;
  private path: string | undefined;

  constructor(options?: GraphOptions) {
    this.path = options ? options.path || undefined : undefined;
    this.nodeMap = {} as NodeRecords<T>;
  }

  static from<T extends Key>(nodes: Array<Key | Value<T> | Array<Key | Value<T>>>, options?: GraphOptions) {
    const graph = new Graph(options);
    nodes.forEach((node) => (isArray(node) ? graph.add.apply(graph, node) : graph.add(node as Key | Value<T>)));
    return graph;
  }

  key(keyOrValue: Key | Value<T>): Key {
    if (this.path) return typeof keyOrValue === 'object' ? (get(keyOrValue, this.path) as Key) : keyOrValue;
    return keyOrValue as Key;
  }

  keys(): Array<Key> {
    const keys = [];
    for (const key in this.nodeMap) keys.push(key);
    return keys;
  }

  value(key: Key): Value<T> | T {
    return this.nodeMap[key].value;
  }

  edges(key: Key): Array<T> {
    return this.nodeMap[key].edges;
  }

  add(keyOrValue: Key | Value<T>, toKeyOrValue?: Key | Value<T>) {
    const key = this.key(keyOrValue);
    const value = this.path ? (typeof keyOrValue === 'object' ? keyOrValue : undefined) : keyOrValue;
    if (value !== undefined) {
      if (this.nodeMap[key] === undefined) this.nodeMap[key] = { value, edges: [] };
      else if (this.nodeMap[key].value !== value) throw new Error(`Adding different node values to same graph. Key ${key as string}. Existing: ${JSON.stringify(this.nodeMap[key].value)}. New: ${JSON.stringify(value)}`);
    }
    // biome-ignore lint/style/noArguments: <explanation>
    if (arguments.length === 1) return;

    // add edge
    this.add(toKeyOrValue);
    const toKey = this.key(toKeyOrValue);
    this.nodeMap[key].edges.push(toKey);
  }

  degrees<T extends Key>(): Counter<T, number> {
    const degrees = {} as Counter<T, number>;
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
