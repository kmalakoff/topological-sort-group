import type Graph from './Graph.ts';

import type { Cycle, Key } from './types.ts';

export default function cycles<T>(graph: Graph<T>): Cycle[] {
  const visited: Record<Key, boolean> = {};
  const marks: Record<Key, boolean> = {};
  const cycles: Cycle[] = [];

  function visit(key: Key, ancestors: Cycle) {
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
  let keys: Key[] = graph.keys();
  while (keys.length > 0) {
    visit(keys[0], []);

    // remove processed
    keys = keys.filter((key) => !visited[key]);
  }

  return cycles;
}
