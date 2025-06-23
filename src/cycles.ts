import type Graph from './Graph.ts';

import type { Cycle, Key } from './types.ts';

interface Visited {
  [key: Key]: boolean;
}
interface Marked {
  [key: Key]: boolean;
}

export default function cycles<T extends Key>(graph: Graph<T>): Cycle<T>[] {
  const visited: Visited = {};
  const marks: Marked = {};
  const cycles: Cycle<T>[] = [];

  function visit(key: T, ancestors: Cycle<T>) {
    if (marks[key]) return cycles.push(ancestors.concat(key)); // found a cycle
    if (visited[key]) return; // already visited
    visited[key] = true;

    // check for cycles from this key
    marks[key] = true;
    graph.edges(key).forEach((neighborKey) => {
      visit(neighborKey, ancestors.concat(key));
    });
    delete marks[key];
  }

  // check all keys
  let keys: T[] = graph.keys();
  while (keys.length > 0) {
    visit(keys[0], []);

    // remove processed
    keys = keys.filter((key) => !visited[key]);
  }

  return cycles;
}
