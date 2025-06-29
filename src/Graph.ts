import get from './deepGet.ts';
import type { Cycle, GraphOptions, Key, Node, SortModeEnum, SortResult } from './types.ts';
import { SortMode } from './types.ts';

const isArray = Array.isArray || ((x) => Object.prototype.toString.call(x) === '[object Array]');

export default class Graph<T> {
  protected size: number;
  static SortMode = SortMode;

  private nodeMap: Record<Key, Node<T>>;
  private path: string | undefined;

  constructor(options?: GraphOptions) {
    this.size = 0;
    this.path = options?.path;
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
      if (this.nodeMap[key] === undefined) {
        this.nodeMap[key] = { value: value as T, edges: [] } as Node<T>;
        this.size++;
      } else if (this.nodeMap[key].value !== value) throw new Error(`Adding different node values to same graph. Key ${key as string}. Existing: ${JSON.stringify(this.nodeMap[key].value)}. New: ${JSON.stringify(value)}`);
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

  cycles(): Cycle[] {
    const visited: Record<Key, boolean> = {};
    const marks: Record<Key, boolean> = {};
    const cycles: Cycle[] = [];

    const visit = (key: Key, ancestors: Cycle) => {
      if (marks[key]) return cycles.push(ancestors.concat(key)); // found a cycle
      if (visited[key]) return; // already visited
      visited[key] = true;

      // check for cycles from this key
      marks[key] = true;
      this.edges(key).forEach((neighborKey) => {
        visit(neighborKey, ancestors.concat(key));
      });
      delete marks[key];
    };

    // check all keys
    let keys: Key[] = this.keys();
    while (keys.length > 0) {
      visit(keys[0], []);
      keys = keys.filter((key) => !visited[key]); // remove processed
    }

    return cycles;
  }

  sort(mode: SortModeEnum = SortMode.Group): SortResult<T> {
    const degrees = this.degrees();

    // Initialize queue with no links
    const queue = [];
    for (const key in degrees) {
      if (degrees[key] === 0) queue.push({ key, level: 0 });
    }

    const nodes = [];
    const groups = [];

    // process each level
    let processed = 0;
    let level = 0;
    while (queue.length > 0) {
      const queued = queue.shift();

      // If we're moving to a new level, store the previous level's nodes
      if (mode === SortMode.Group && queued.level > level) {
        groups.push(nodes.splice(0, nodes.length));
        level = queued.level;
      }
      nodes.push(this.value(queued.key));
      processed++;

      // Process neighbors
      const neighbors = this.edges(queued.key);
      for (let i = 0; i < neighbors.length; i++) {
        const key = neighbors[i];
        if (--degrees[key] === 0) {
          queue.push({ key, level: level + 1 });
        }
      }
    }

    // Add the last nodes
    if (mode === SortMode.Group && nodes.length > 0) groups.push(nodes);

    return {
      nodes: mode === SortMode.Group ? groups : nodes,
      cycles: processed !== this.size ? this.cycles() : [],
    };
  }
}
