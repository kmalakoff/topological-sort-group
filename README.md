## topological-sort-group

Topological sorting and cycle detection. Optional grouping for parallel processing.

# sort by group - default
```
import assert from 'assert';
import { Graph, SortMode } from 'topological-sort-group';

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

const result = graph.sort(); // SortMode.Group is default
assert.deepEqual(result.nodes, [[{ package: { name: 'D' } }], [{ package: { name: 'E' } }], [{ package: { name: 'F' } }]]);
assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
assert.deepEqual(result.duplicates, []); // No duplicate keys
```

# sort flat
```
import assert from 'assert';
import { Graph, SortMode } from 'topological-sort-group';

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
const result = graph.sort(SortMode.Flat);
assert.deepEqual(result.nodes, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
assert.deepEqual(result.cycles, []);
assert.deepEqual(result.duplicates, []); // No duplicate keys
```

# handling duplicates
```
import assert from 'assert';
import { Graph } from 'topological-sort-group';

const graph = Graph.from(
  [
    { package: { name: 'A' } },
    { package: { name: 'B' } },
    { package: { name: 'A' } }, // Duplicate key with different value
  ],
  { path: 'package.name' }
);

const result = graph.sort();
assert.deepEqual(result.nodes, [[{ package: { name: 'B' } }]]); // Only non-duplicate nodes
assert.deepEqual(result.cycles, []);
assert.deepEqual(result.duplicates, [{
  key: 'A',
  values: [
    { package: { name: 'A' } },
    { package: { name: 'A' } }
  ]
}]);
```

### Documentation

[API Docs](https://kmalakoff.github.io/topological-sort-group/)
