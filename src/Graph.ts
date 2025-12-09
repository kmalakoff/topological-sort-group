import get from './deepGet.ts';
import type { Cycle, DependencyGraph, DuplicateKey, GraphOptions, Key, Node, SortModeEnum, SortResult } from './types.ts';
import { SortMode } from './types.ts';

export default class Graph<T> {
  protected size: number;
  static SortMode = SortMode;

  private nodeMap: Record<Key, Node<T>>;
  private duplicateMap: Record<Key, T[]>;
  private path: string | undefined;

  constructor(options?: GraphOptions) {
    this.size = 0;
    this.path = options?.path;
    this.nodeMap = {};
    this.duplicateMap = {};
  }

  // Create graph from DependencyGraph format
  static from<T>(input: DependencyGraph<T>, options?: GraphOptions): Graph<T> {
    const graph = new Graph<T>(options);

    // Add all nodes first
    for (const id in input.nodes) {
      graph.addNode(id, input.nodes[id]);
    }

    // Add dependencies (which become edges in the internal representation)
    for (const dependent in input.dependencies) {
      const deps = input.dependencies[dependent];
      for (let i = 0; i < deps.length; i++) {
        graph.addDependency(dependent, deps[i]);
      }
    }

    return graph;
  }

  // Export to DependencyGraph format
  toGraph(): DependencyGraph<T> {
    const nodes: Record<string, T> = {};
    const dependencies: Record<string, string[]> = {};

    // Build nodes map
    for (const key in this.nodeMap) {
      nodes[key] = this.nodeMap[key].value;
      dependencies[key] = [];
    }

    // Build dependencies by reversing edges
    // edges[a] contains b means a -> b (b depends on a)
    // So we need to add a to dependencies[b]
    for (const from in this.nodeMap) {
      const edges = this.nodeMap[from].edges;
      for (let i = 0; i < edges.length; i++) {
        const to = edges[i] as string;
        if (dependencies[to]) {
          dependencies[to].push(from);
        }
      }
    }

    return { nodes, dependencies };
  }

  private key(keyOrValue: Key | T): Key {
    if (this.path) return typeof keyOrValue === 'object' ? (get(keyOrValue, this.path) as Key) : (keyOrValue as Key);
    return keyOrValue as Key;
  }

  keys(): Key[] {
    const keys = [];
    for (const key in this.nodeMap) keys.push(key);
    return keys;
  }

  value(key: Key): T {
    if (this.nodeMap[key] === undefined) {
      throw new Error(`Node with key '${String(key)}' does not exist in graph`);
    }
    return this.nodeMap[key].value;
  }

  edges(key: Key): Key[] {
    if (this.nodeMap[key] === undefined) {
      throw new Error(`Node with key '${String(key)}' does not exist in graph`);
    }
    return this.nodeMap[key].edges;
  }

  // Add a node - key extracted from value using path option
  addNode(value: T): void;
  // Add a node with explicit id
  addNode(id: string, value: T): void;
  addNode(idOrValue: string | T, value?: T): void {
    // Determine if called with (value) or (id, value)
    let id: Key;
    let nodeValue: T;

    if (value === undefined) {
      // Called as addNode(value) - extract key from path
      nodeValue = idOrValue as T;
      if (nodeValue === null || nodeValue === undefined) {
        throw new Error('Cannot add null or undefined to graph');
      }
      id = this.key(nodeValue);
      if (this.path && id === undefined) {
        throw new Error(`Node is missing required path '${this.path}'`);
      }
    } else {
      // Called as addNode(id, value)
      id = idOrValue as string;
      nodeValue = value;
      if (id === null || id === undefined) {
        throw new Error('Cannot add null or undefined id to graph');
      }
      if (nodeValue === null || nodeValue === undefined) {
        throw new Error('Cannot add null or undefined value to graph');
      }
    }

    if (this.nodeMap[id] === undefined) {
      this.nodeMap[id] = { value: nodeValue, edges: [] } as Node<T>;
      this.size++;
    } else if (this.nodeMap[id].value !== nodeValue) {
      // Track duplicate instead of throwing
      if (this.duplicateMap[id] === undefined) {
        this.duplicateMap[id] = [this.nodeMap[id].value];
      }
      this.duplicateMap[id].push(nodeValue);
    }
  }

  // Add a dependency: dependent depends on dependency
  // This creates an edge from dependency -> dependent (dependency must come before dependent)
  addDependency(dependent: string, dependency: string): void {
    if (dependent === null || dependent === undefined) {
      throw new Error('Cannot add null or undefined dependent to graph');
    }
    if (dependency === null || dependency === undefined) {
      throw new Error('Cannot add null or undefined dependency to graph');
    }

    // Ensure both nodes exist (create with key as value if not using path)
    if (this.nodeMap[dependency] === undefined) {
      this.nodeMap[dependency] = { value: dependency as unknown as T, edges: [] } as Node<T>;
      this.size++;
    }
    if (this.nodeMap[dependent] === undefined) {
      this.nodeMap[dependent] = { value: dependent as unknown as T, edges: [] } as Node<T>;
      this.size++;
    }

    // Add edge: dependency -> dependent (dependency unlocks dependent)
    this.nodeMap[dependency].edges.push(dependent);
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
    // Validate sort mode
    if (mode !== SortMode.Group && mode !== SortMode.Flat) {
      throw new Error(`Invalid sort mode: ${mode}. Use SortMode.Group (${SortMode.Group}) or SortMode.Flat (${SortMode.Flat})`);
    }

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

    // Build duplicates array
    const duplicates: DuplicateKey<T>[] = [];
    for (const key in this.duplicateMap) {
      duplicates.push({ key: key as Key, values: this.duplicateMap[key] });
    }

    return {
      nodes: mode === SortMode.Group ? groups : nodes,
      cycles: processed !== this.size ? this.cycles() : [],
      duplicates,
    };
  }
}
