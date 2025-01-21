import type Graph from './Graph';
import cycles from './cycles';

import type { Key } from './types';
import { SortMode } from './types';

// find nodes with no incoming nodes
function findRoots(graph, degrees) {
  const sources = [];
  for (const fromKey in degrees) {
    if (degrees[fromKey] === 0) sources.push(graph.nodeMap[fromKey].value);
  }
  return sources;
}

export default function sort<T extends Key>(graph: Graph<T>, mode: SortMode = SortMode.Group) {
  const degrees = graph.degrees();

  // process the nodes level by level
  const nodes = [];
  let currentLevel = findRoots(graph, degrees);
  while (currentLevel.length > 0) {
    nodes.push(currentLevel.slice());

    // track next level's nodes
    const nextLevel = [];
    const processed = {};

    // process all nodes in current level
    currentLevel.forEach((node) => {
      const nodeKey = graph.key ? node[graph.key] : node;
      // remove the node
      degrees[nodeKey] = -1;

      // reduce degrees for all neighbors
      graph.nodeMap[nodeKey].edges.forEach((neighborKey) => {
        degrees[neighborKey]--;

        // If neighbor has no more dependencies and hasn't been processed
        if (degrees[neighborKey] === 0 && !processed[neighborKey]) {
          const neighbor = graph.nodeMap[neighborKey].value;
          nextLevel.push(neighbor);
          processed[neighborKey] = true;
        }
      });
    });

    // Move to next level
    currentLevel = nextLevel;
  }

  // Check for cycles
  let hasCycles = false;
  for (const from in degrees) {
    if (degrees[from] > 0) {
      hasCycles = true;
      break;
    }
  }

  return {
    nodes: mode === SortMode.Flat ? nodes.reduce((m, l) => m.concat(l), []) : nodes,
    cycles: hasCycles ? cycles(graph) : [],
  };
}
