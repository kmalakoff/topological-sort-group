## topological-sort-group

Topological sorting and cycle detection. Optional grouping for parallel processing.

# Quick Start

```typescript
import Graph, { type DependencyGraph } from 'topological-sort-group';

const graph = Graph.from<string>({
  nodes: { A: 'A', B: 'B', C: 'C', D: 'D' },
  dependencies: {
    A: [],        // A has no dependencies
    B: ['A'],     // B depends on A
    C: ['A'],     // C depends on A
    D: ['B', 'C'] // D depends on B and C
  }
});

const result = graph.sort();
// result.nodes = [['A'], ['B', 'C'], ['D']]  // Groups for parallel execution
// result.cycles = []
// result.duplicates = []
```

# sort by group - default

```typescript
import assert from 'assert';
import Graph from 'topological-sort-group';

interface Package {
  package: { name: string };
}

const graph = Graph.from<Package>({
  nodes: {
    A: { package: { name: 'A' } },
    B: { package: { name: 'B' } },
    C: { package: { name: 'C' } },
    D: { package: { name: 'D' } },
    E: { package: { name: 'E' } },
    F: { package: { name: 'F' } },
  },
  dependencies: {
    A: ['B'],  // A depends on B (creates cycle with B depending on A)
    B: ['A'],  // B depends on A (creates cycle)
    C: ['B'],  // C depends on B
    D: [],     // D has no dependencies
    E: ['D'],  // E depends on D
    F: ['E'],  // F depends on E
  },
});

const result = graph.sort(); // SortMode.Group is default
assert.deepEqual(result.nodes, [
  [{ package: { name: 'D' } }],
  [{ package: { name: 'E' } }],
  [{ package: { name: 'F' } }]
]);
assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
assert.deepEqual(result.duplicates, []);
```

# sort flat

```typescript
import assert from 'assert';
import Graph, { SortMode } from 'topological-sort-group';

const graph = Graph.from<string>({
  nodes: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H' },
  dependencies: {
    A: [],
    B: [],
    C: ['A', 'B'],  // C depends on A and B
    D: ['B'],       // D depends on B
    E: ['C'],       // E depends on C
    F: ['D', 'E'],  // F depends on D and E
    G: ['E'],       // G depends on E
    H: ['F'],       // H depends on F
  },
});

const result = graph.sort(SortMode.Flat);
assert.deepEqual(result.nodes, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
assert.deepEqual(result.cycles, []);
assert.deepEqual(result.duplicates, []);
```

# Building graphs incrementally

```typescript
import assert from 'assert';
import Graph, { SortMode } from 'topological-sort-group';

const graph = new Graph<string>();
graph.addNode('A', 'A');
graph.addNode('B', 'B');
graph.addNode('C', 'C');
graph.addDependency('B', 'A');  // B depends on A
graph.addDependency('C', 'B');  // C depends on B

const result = graph.sort(SortMode.Flat);
assert.deepEqual(result.nodes, ['A', 'B', 'C']);

// Export back to DependencyGraph format
const exported = graph.toGraph();
assert.deepEqual(exported.nodes, { A: 'A', B: 'B', C: 'C' });
assert.deepEqual(exported.dependencies, { A: [], B: ['A'], C: ['B'] });
```

# Using path option for objects

```typescript
import assert from 'assert';
import Graph from 'topological-sort-group';

interface Named {
  name: string;
}

const A = { name: 'A' };
const B = { name: 'B' };
const C = { name: 'C' };

// Use path option to extract keys from objects
const graph = new Graph<Named>({ path: 'name' });
graph.addNode(A);  // Key 'A' extracted from A.name
graph.addNode(B);  // Key 'B' extracted from B.name
graph.addNode(C);  // Key 'C' extracted from C.name
graph.addDependency('B', 'A');  // B depends on A
graph.addDependency('C', 'B');  // C depends on B

const result = graph.sort();
assert.deepEqual(result.nodes, [[A], [B], [C]]);
```

# Handling duplicates

```typescript
import assert from 'assert';
import Graph from 'topological-sort-group';

interface Named {
  name: string;
}

const graph = new Graph<Named>({ path: 'name' });
graph.addNode({ name: 'A' });
graph.addNode({ name: 'B' });
graph.addNode({ name: 'A' });  // Duplicate key 'A' with different value

const result = graph.sort();
// Duplicates are tracked but the first value is used
assert.deepEqual(result.duplicates, [{
  key: 'A',
  values: [
    { name: 'A' },
    { name: 'A' }
  ]
}]);
```

## Types

```typescript
// The standard graph format used by this library
interface DependencyGraph<T> {
  nodes: Record<string, T>;              // Map of id -> item
  dependencies: Record<string, string[]>; // Map of id -> ids it depends on
}

// Sort result
interface SortResult<T> {
  nodes: T[] | T[][];           // Flat or grouped nodes
  cycles: string[][];           // Detected cycles
  duplicates: DuplicateKey<T>[]; // Duplicate keys
}

// Duplicate key info
interface DuplicateKey<T> {
  key: string;
  values: T[];  // All values that were added with this key
}
```

### Documentation

[API Docs](https://kmalakoff.github.io/topological-sort-group/)
