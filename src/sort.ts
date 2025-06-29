import cycles from './cycles.ts';
import type Graph from './Graph.ts';

import { SortMode, type SortModeEnum, type SortResult } from './types.ts';

export default function sort<T>(graph: Graph<T>, mode: SortModeEnum = SortMode.Group): SortResult<T> {
  const degrees = graph.degrees();

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
    nodes.push(graph.value(queued.key));
    processed++;

    // Process neighbors
    const neighbors = graph.edges(queued.key);
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
    cycles: processed !== graph.size() ? cycles<T>(graph) : [],
  };
}
