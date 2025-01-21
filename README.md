## topological-sort-group

Topological sorting and cycle detection. Optional grouping for parallel processing.

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

```
import assert from 'assert';
import { Graph, sort, SortMode } from 'topological-sort-group';

const graph = Graph.from(
  [
    /* nodes */
    { name: 'A' },
    { name: 'B' },
    { name: 'C' },
    { name: 'D' },
    { name: 'E' },
    { name: 'F' },
    /* edges */
    ['A', 'B'],
    ['B', 'C'],
    ['D', 'E'],
    ['E', 'F'],
    ['B', 'A'], // Creates a cycle
  ],
  { key: 'name' }
);

const result = sort(graph, SortMode.Group);
assert.deepEqual(result.nodes, [[{ name: 'D' }], [{ name: 'E' }], [{ name: 'F' }]]);
assert.deepEqual(result.cycles, [[{ name: 'A' }, { name: 'B' }, { name: 'A' }]]);
```

### Documentation

[API Docs](https://kmalakoff.github.io/topological-sort-group/)
