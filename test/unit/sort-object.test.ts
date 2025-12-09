import assert from 'assert';

import Graph, { SortMode, type SortModeEnum } from 'topological-sort-group';

interface Named {
  name: string;
}

interface Nested {
  package: Named;
}

const A = { name: 'A' };
const B = { name: 'B' };
const C = { name: 'C' };
const D = { name: 'D' };
const E = { name: 'E' };
const F = { name: 'F' };
const G = { name: 'G' };
const H = { name: 'H' };

describe('sort object', () => {
  describe('flat', () => {
    it('no cycles', () => {
      const graph = Graph.from<Named>({
        nodes: { A, B, C, D, E, F, G, H },
        dependencies: {
          A: [],
          B: [],
          C: ['A', 'B'],
          D: ['B'],
          E: ['C'],
          F: ['D', 'E'],
          G: ['E'],
          H: ['F'],
        },
      });
      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, [A, B, C, D, E, F, G, H]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles with isolated node', () => {
      const graph = Graph.from<Named>({
        nodes: { A, B, C, D, E, F, H },
        dependencies: {
          A: [],
          B: ['A'],
          C: ['B'],
          D: [],
          E: ['D'],
          F: ['E'],
          H: [],
        },
      });
      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, [A, D, H, B, E, C, F]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const graph = Graph.from<Named>({
        nodes: { A, B, C, D, E, F },
        dependencies: {
          A: ['B'], // A depends on B (from [B, A])
          B: ['A'], // B depends on A (from [A, B]) - creates cycle
          C: ['B'], // C depends on B (from [B, C])
          D: [],
          E: ['D'], // E depends on D (from [D, E])
          F: ['E'], // F depends on E (from [E, F])
        },
      });

      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, [D, E, F]);
      assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
    });
  });

  describe('group', () => {
    it('no cycles', () => {
      const graph = Graph.from<Named>({
        nodes: { A, B, C, D, E, F, G, H },
        dependencies: {
          A: [],
          B: [],
          C: ['A', 'B'],
          D: ['B'],
          E: ['C'],
          F: ['D', 'E'],
          G: ['E'],
          H: ['F'],
        },
      });
      const result = graph.sort();
      assert.deepEqual(result.nodes, [[A, B], [C, D], [E], [F, G], [H]]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles with isolated node', () => {
      const graph = Graph.from<Named>({
        nodes: { A, B, C, D, E, F, G },
        dependencies: {
          A: [],
          B: ['A'],
          C: ['B'],
          D: [],
          E: ['D'],
          F: ['E'],
          G: [],
        },
      });
      const result = graph.sort();
      assert.deepEqual(result.nodes, [
        [A, D, G],
        [B, E],
        [C, F],
      ]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const pA = { package: A };
      const pB = { package: B };
      const pC = { package: C };
      const pD = { package: D };
      const pE = { package: E };
      const pF = { package: F };

      const graph = Graph.from<Nested>({
        nodes: { A: pA, B: pB, C: pC, D: pD, E: pE, F: pF },
        dependencies: {
          A: ['B'], // A depends on B
          B: ['A'], // B depends on A - creates cycle
          C: ['B'], // C depends on B
          D: [],
          E: ['D'],
          F: ['E'],
        },
      });

      const result = graph.sort();
      assert.deepEqual(result.nodes, [[pD], [pE], [pF]]);
      assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
    });
  });

  describe('addNode with path option', () => {
    it('extracts key from path', () => {
      const graph = new Graph<Named>({ path: 'name' });
      graph.addNode(A);
      graph.addNode(B);
      graph.addNode(C);
      graph.addDependency('B', 'A');
      graph.addDependency('C', 'B');

      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, [A, B, C]);
    });

    it('extracts key from nested path', () => {
      const pA = { package: A };
      const pB = { package: B };
      const pC = { package: C };

      const graph = new Graph<Nested>({ path: 'package.name' });
      graph.addNode(pA);
      graph.addNode(pB);
      graph.addNode(pC);
      graph.addDependency('B', 'A');
      graph.addDependency('C', 'B');

      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, [pA, pB, pC]);
    });

    it('toGraph works with path option', () => {
      const graph = new Graph<Named>({ path: 'name' });
      graph.addNode(A);
      graph.addNode(B);
      graph.addDependency('B', 'A');

      const exported = graph.toGraph();
      assert.deepEqual(exported.nodes, { A, B });
      assert.deepEqual(exported.dependencies, { A: [], B: ['A'] });
    });
  });

  describe('duplicates', () => {
    it('duplicates reported in result', () => {
      const _graph = Graph.from<Named>({
        nodes: { A, B, C, D, E, F, G, H },
        dependencies: {
          A: [],
          B: [],
          C: ['A', 'B'],
          D: ['B'],
          E: ['C'],
          F: ['D', 'E'],
          G: ['E'],
          H: ['F'],
        },
      });
      // Add a duplicate B with different value
      const graph2 = new Graph<Named>({ path: 'name' });
      graph2.addNode(A);
      graph2.addNode(B);
      graph2.addNode({ name: 'B' }); // duplicate
      graph2.addNode(C);
      graph2.addDependency('C', 'A');
      graph2.addDependency('C', 'B');

      const result = graph2.sort();

      // Should have duplicates for key 'B'
      assert.equal(result.duplicates.length, 1);
      assert.equal(result.duplicates[0].key, 'B');
      assert.equal(result.duplicates[0].values.length, 2);
      assert.deepEqual(result.duplicates[0].values[0], B);
      assert.deepEqual(result.duplicates[0].values[1], { name: 'B' });
    });

    it('multiple duplicates for same key', () => {
      const graph = new Graph<Named>({ path: 'name' });
      graph.addNode(A);
      graph.addNode({ name: 'A' });
      graph.addNode({ name: 'A' });
      graph.addNode({ name: 'A' });

      const result = graph.sort();

      // Should have duplicates for key 'A' with 4 total values
      assert.equal(result.duplicates.length, 1);
      assert.equal(result.duplicates[0].key, 'A');
      assert.equal(result.duplicates[0].values.length, 4);
    });

    it('multiple different duplicates', () => {
      const graph = new Graph<Named>({ path: 'name' });
      graph.addNode(A);
      graph.addNode({ name: 'A' });
      graph.addNode(B);
      graph.addNode({ name: 'B' });
      graph.addNode(C);

      const result = graph.sort();

      // Should have duplicates for keys 'A' and 'B'
      assert.equal(result.duplicates.length, 2);
      const duplicateKeys = result.duplicates.map((d) => d.key).sort();
      assert.deepEqual(duplicateKeys, ['A', 'B']);
    });

    it('no duplicates when no conflicts', () => {
      const graph = new Graph<Named>({ path: 'name' });
      graph.addNode(A);
      graph.addNode(B);
      graph.addNode(C);

      const result = graph.sort();

      // Should have no duplicates
      assert.equal(result.duplicates.length, 0);
    });
  });

  describe('validation errors', () => {
    it('throws on null addNode value', () => {
      const graph = new Graph<Named>({ path: 'name' });
      assert.throws(() => {
        graph.addNode(null as unknown as Named);
      }, /Cannot add null or undefined to graph/);
    });

    it('throws on undefined addNode value', () => {
      const graph = new Graph<Named>({ path: 'name' });
      assert.throws(() => {
        graph.addNode(undefined as unknown as Named);
      }, /Cannot add null or undefined to graph/);
    });

    it('throws on missing required path', () => {
      const graph = new Graph<{ id: string }>({ path: 'name' });
      assert.throws(() => {
        graph.addNode({ id: 'test' });
      }, /Node is missing required path 'name'/);
    });

    it('throws on null addDependency dependent', () => {
      const graph = new Graph<Named>({ path: 'name' });
      graph.addNode(A);
      assert.throws(() => {
        graph.addDependency(null as unknown as string, 'A');
      }, /Cannot add null or undefined dependent to graph/);
    });

    it('throws on null addDependency dependency', () => {
      const graph = new Graph<Named>({ path: 'name' });
      graph.addNode(A);
      assert.throws(() => {
        graph.addDependency('A', null as unknown as string);
      }, /Cannot add null or undefined dependency to graph/);
    });

    it('throws on accessing non-existent node value', () => {
      const graph = new Graph<Named>({ path: 'name' });
      graph.addNode(A);
      graph.addNode(B);
      assert.throws(() => {
        graph.value('Z');
      }, /Node with key 'Z' does not exist in graph/);
    });

    it('throws on accessing non-existent node edges', () => {
      const graph = new Graph<Named>({ path: 'name' });
      graph.addNode(A);
      graph.addNode(B);
      assert.throws(() => {
        graph.edges('Z');
      }, /Node with key 'Z' does not exist in graph/);
    });

    it('throws on invalid sort mode', () => {
      const graph = new Graph<Named>({ path: 'name' });
      graph.addNode(A);
      graph.addNode(B);
      assert.throws(() => {
        graph.sort(999 as SortModeEnum);
      }, /Invalid sort mode: 999/);
    });
  });
});
