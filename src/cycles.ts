import type Graph from './Graph.js';

import type { Cycle, Key } from './types.js';

export default function cycles<T extends Key>(graph: Graph<T>): Cycle<T>[] {
  const visited = {};
  const marks = {};
  const cycles = [];

  function visit(key, ancestors) {
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
  let keys = graph.keys();
  while (keys.length > 0) {
    visit(keys[0], []);

    // remove processed
    keys = keys.filter((key) => !visited[key]);
  }

  return cycles;
}
