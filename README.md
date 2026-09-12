# topological-sort-group

Sort dependency graphs, detect cycles, and optionally group independent nodes
for parallel processing.

```bash
npm install topological-sort-group
```

## Quick start

```ts
import Graph from 'topological-sort-group';

const graph = Graph.from({
  nodes: { build: 'build', test: 'test', package: 'package' },
  dependencies: {
    build: [],
    test: ['build'],
    package: ['build'],
  },
});

const result = graph.sort();
console.log(result.nodes); // [['build'], ['test', 'package']]
console.log(result.cycles); // []
```

Grouped sorting is the default. Use `SortMode.Flat` for a single ordered array:

```ts
import Graph, { SortMode } from 'topological-sort-group';

const ordered = Graph.from(input).sort(SortMode.Flat);
```

## Building a graph

```ts
const graph = new Graph<string>();
graph.addNode('build', 'build');
graph.addNode('test', 'test');
graph.addDependency('test', 'build'); // test depends on build

const result = graph.sort();
const exported = graph.toGraph();
```

`sort()` returns `nodes`, `cycles`, and `duplicates`. Nodes involved in cycles
are omitted from the sorted nodes and reported as key paths in `cycles`.

To derive keys from object values, construct the graph with a property path:

```ts
const graph = new Graph<{ name: string }>({ path: 'name' });
graph.addNode({ name: 'build' });
```

Adding another value with the same derived key keeps the first value and reports
all conflicting values in `duplicates`.

## Documentation

[API documentation](https://kmalakoff.github.io/topological-sort-group/)
