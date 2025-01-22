## topological-sort-group

Topological sorting and cycle detection. Optional grouping for parallel processing.

# sort by group - default
```
import assert from 'assert';
import { Graph, sort, SortMode } from 'topological-sort-group';

const graph = Graph.from(
  [
    /* nodes */
    { package: { name: 'A' } },
    { package: { name: 'B' } },
    { package: { name: 'C' } },
    { package: { name: 'D' } },
    { package: { name: 'E' } },
    { package: { name: 'F' } },
    /* edges */
    ['A', 'B'],
    ['B', 'C'],
    ['D', 'E'],
    ['E', 'F'],
    ['B', 'A'], // Creates a cycle
  ],
  { path: 'package.name' }
);

const result = sort(graph);
assert.deepEqual(result.nodes, [[{ package: { name: 'D' } }], [{ package: { name: 'E' } }], [{ package: { name: 'F' } }]]);
assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
```

# sort flat
```
import assert from 'assert';
import { Graph, sort, SortMode } from 'topological-sort-group';

const graph = Graph.from([
  ['A', 'C'],
  ['B', 'C'],
  ['B', 'D'],
  ['C', 'E'],
  ['D', 'F'],
  ['E', 'F'],
  ['E', 'G'],
  ['F', 'H'],
]);
const result = sort(graph, SortMode.Flat);
assert.deepEqual(result.nodes, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
assert.deepEqual(result.cycles, []);
```

### Documentation

[API Docs](https://kmalakoff.github.io/topological-sort-group/)
