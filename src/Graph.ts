import get from './deepGet.ts';
import type { Counter, EdgeRef, GraphOptions, Key, Node, NodeRecords, Value } from './types.ts';

const isArray = Array.isArray || ((x) => Object.prototype.toString.call(x) === '[object Array]');

export default class Graph<T extends Key> {
  private nodeMap: NodeRecords<T>;
  private path: string | undefined;

  constructor(options?: GraphOptions) {
    this.path = options ? options.path || undefined : undefined;
    this.nodeMap = {} as NodeRecords<T>;
  }

  static from<T extends Key>(nodes: Array<Node<T> | EdgeRef<T>>, options?: GraphOptions) {
    const graph = new Graph(options);
    nodes.forEach((node) => (isArray(node) ? graph.add.apply(graph, node) : graph.add(node as T | Value<T>)));
    return graph;
  }

  key(keyOrValue: T | Value<T>): T {
    if (this.path) return typeof keyOrValue === 'object' ? (get(keyOrValue, this.path) as T) : keyOrValue;
    return keyOrValue as T;
  }

  keys(): T[] {
    const keys = [];
    for (const key in this.nodeMap) keys.push(key);
    return keys;
  }

  value(key: T): Value<T> | T {
    return this.nodeMap[key].value;
  }

  edges(key: T): T[] {
    return this.nodeMap[key].edges;
  }

  add(keyOrValue: T | Value<T>, toKeyOrValue?: T | Value<T>) {
    const key = this.key(keyOrValue);
    const value = this.path ? (typeof keyOrValue === 'object' ? keyOrValue : undefined) : keyOrValue;
    if (value !== undefined) {
      if (this.nodeMap[key] === undefined) this.nodeMap[key] = { value, edges: [] };
      else if (this.nodeMap[key].value !== value) throw new Error(`Adding different node values to same graph. Key ${key as string}. Existing: ${JSON.stringify(this.nodeMap[key].value)}. New: ${JSON.stringify(value)}`);
    }
    // biome-ignore lint/complexity/noArguments: Apply arguments
    if (arguments.length === 1) return;

    // add edge
    this.add(toKeyOrValue);
    const toKey = this.key(toKeyOrValue);
    this.nodeMap[key].edges.push(toKey);
  }

  degrees(): Counter<T, number> {
    const degrees = {} as Counter<T, number>;
    for (const from in this.nodeMap) {
      if (degrees[from as T] === undefined) degrees[from as T] = 0;
      this.nodeMap[from].edges.forEach((key: T) => {
        if (degrees[key] === undefined) degrees[key] = 0;
        degrees[key]++;
      });
    }
    return degrees;
  }
}
