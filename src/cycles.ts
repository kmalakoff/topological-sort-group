import type Graph from './Graph';

import type { Key } from './types';

export default function cycles<T extends Key>(graph: Graph<T>): Array<Array<T>> {
  const visited = {};
  const marks = {};
  const cycles = [];

  function visit(node, ancestors) {
    // found a cycle
    const nodeKey = graph.key ? node[graph.key] : node;
    if (marks[nodeKey]) {
      cycles.push(ancestors.concat(node));
      return;
    }

    // visit only once
    if (visited[nodeKey]) return;
    visited[nodeKey] = true;

    // check for cycles from here
    marks[nodeKey] = true;

    graph.nodeMap[nodeKey].edges.forEach((neighborKey) => {
      const neighbor = graph.nodeMap[neighborKey].value;
      visit(neighbor, ancestors.concat(node));
    });
    delete marks[nodeKey];
  }

  // check all nodes
  let nodes = graph.nodes();
  while (nodes.length > 0) {
    visit(nodes[0], []);

    // remove processed
    nodes = nodes.filter((node) => {
      const nodeKey = graph.key ? node[graph.key] : node;
      return !visited[nodeKey];
    });
  }

  return cycles;
}
