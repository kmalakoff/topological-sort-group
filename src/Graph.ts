import isArray from './lib/isArray';
import type { Counter, GraphOptions, Key, NestedKey, NodeRecords } from './types';

export default class Graph<T extends Key> {
  nodeMap: NodeRecords<T>;
  key: Key | undefined;

  constructor(options?: GraphOptions) {
    this.key = options ? options.key : undefined;
    this.nodeMap = {} as NodeRecords<T>;
  }

  static from<T extends Key>(nodes: Array<Key | NestedKey<T> | Array<Key | NestedKey<T>>>, options?: GraphOptions) {
    const graph = new Graph(options);
    nodes.forEach((node) => (isArray(node) ? graph.add.apply(graph, node) : graph.add(node as Key | NestedKey<T>)));
    return graph;
  }

  add(from: Key | NestedKey<T>, to?: Key | NestedKey<T>) {
    const fromKey = this.key ? from[this.key] || from : from;
    if (!this.nodeMap[fromKey] && (!this.key || typeof from === 'object')) {
      this.nodeMap[fromKey] = { value: from, edges: [] };
    }
    if (to === undefined) return;

    // add edge
    const toKey = this.key ? to[this.key] || to : to;
    if (!this.nodeMap[toKey] && (!this.key || typeof to === 'object')) {
      this.nodeMap[toKey] = { value: to, edges: [] };
    }
    this.nodeMap[fromKey].edges.push(toKey);
  }

  nodes(): Array<NestedKey<T> | T> {
    const nodes = [];
    for (const from in this.nodeMap) {
      nodes.push(this.nodeMap[from].value);
    }
    return nodes;
  }

  degrees<T extends Key>(): Counter<T> {
    const degrees = {} as Counter<T>;
    for (const from in this.nodeMap) {
      if (degrees[from as Key] === undefined) degrees[from as Key] = 0;
      this.nodeMap[from].edges.forEach((toKey: Key) => {
        if (degrees[toKey] === undefined) degrees[toKey] = 0;
        degrees[toKey]++;
      });
    }
    return degrees;
  }
}
