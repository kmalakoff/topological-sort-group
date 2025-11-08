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
      const graph = Graph.from<Named>(
        [
          [A, C],
          [B, C],
          [B, D],
          [C, E],
          [D, F],
          [E, F],
          [E, G],
          [F, H],
        ],
        { path: 'name' }
      );
      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, [A, B, C, D, E, F, G, H]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles', () => {
      const graph = Graph.from<Named>([[A, B], [B, C], [D, E], [E, F], H], { path: 'name' });
      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, [A, D, H, B, E, C, F]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const graph = Graph.from<Named>(
        [
          [A, B],
          [B, C],
          [D, E],
          [E, F],
          [B, A], // Creates a cycle
        ],
        { path: 'name' }
      );

      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, [D, E, F]);
      assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
    });
  });
  describe('group', () => {
    it('no cycles', () => {
      const graph = Graph.from<Named>(
        [
          [A, C],
          [B, C],
          [B, D],
          [C, E],
          [D, F],
          [E, F],
          [E, G],
          [F, H],
        ],
        { path: 'name' }
      );
      const result = graph.sort();
      assert.deepEqual(result.nodes, [[A, B], [C, D], [E], [F, G], [H]]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles', () => {
      const graph = Graph.from<Named>([[A, B], [B, C], [D, E], [E, F], G], { path: 'name' });
      const result = graph.sort();
      assert.deepEqual(result.nodes, [
        [A, D, G],
        [B, E],
        [C, F],
      ]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const graph = Graph.from<Nested>(
        [
          /* nodes */
          { package: A },
          { package: B },
          { package: C },
          { package: D },
          { package: E },
          { package: F },
          /* edges */
          ['A', 'B'],
          ['B', 'C'],
          ['D', 'E'],
          ['E', 'F'],
          ['B', 'A'], // Creates a cycle
        ],
        { path: 'package.name' }
      );

      const result = graph.sort();
      assert.deepEqual(result.nodes, [[{ package: D }], [{ package: E }], [{ package: F }]]);
      assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
    });
  });
  describe('errors', () => {
    it('duplicates reported in result', () => {
      const graph = Graph.from<Named>(
        [
          [A, C],
          [B, C],
          [{ name: 'B' }, D],
          [C, E],
          [D, F],
          [E, F],
          [E, G],
          [F, H],
        ],
        { path: 'name' }
      );
      const result = graph.sort();

      // Should have duplicates for key 'B'
      assert.equal(result.duplicates.length, 1);
      assert.equal(result.duplicates[0].key, 'B');
      assert.equal(result.duplicates[0].values.length, 2);
      assert.deepEqual(result.duplicates[0].values[0], B);
      assert.deepEqual(result.duplicates[0].values[1], { name: 'B' });
    });

    it('multiple duplicates for same key', () => {
      const graph = Graph.from<Named>([A, { name: 'A' }, { name: 'A' }, { name: 'A' }], { path: 'name' });
      const result = graph.sort();

      // Should have duplicates for key 'A' with 4 total values
      assert.equal(result.duplicates.length, 1);
      assert.equal(result.duplicates[0].key, 'A');
      assert.equal(result.duplicates[0].values.length, 4);
    });

    it('multiple different duplicates', () => {
      const graph = Graph.from<Named>([A, { name: 'A' }, B, { name: 'B' }, C], { path: 'name' });
      const result = graph.sort();

      // Should have duplicates for keys 'A' and 'B'
      assert.equal(result.duplicates.length, 2);
      const duplicateKeys = result.duplicates.map((d) => d.key).sort();
      assert.deepEqual(duplicateKeys, ['A', 'B']);
    });

    it('no duplicates when no conflicts', () => {
      const graph = Graph.from<Named>([A, B, C], { path: 'name' });
      const result = graph.sort();

      // Should have no duplicates
      assert.equal(result.duplicates.length, 0);
    });

    it('duplicates excluded from sort results', () => {
      const graph = Graph.from<Named>(
        [
          [A, C],
          [B, C],
          [{ name: 'B' }, D],
        ],
        { path: 'name' }
      );
      const result = graph.sort();

      // B is duplicated, so only first B should be in the graph
      // A and B should be at level 0, C at level 1
      assert.deepEqual(result.nodes, [[A, B], [C]]);
      assert.equal(result.duplicates.length, 1);
    });
  });

  describe('validation errors', () => {
    it('throws on null input', () => {
      assert.throws(() => {
        Graph.from<Named>([null], { path: 'name' });
      }, /Cannot add null or undefined to graph/);
    });

    it('throws on undefined input', () => {
      assert.throws(() => {
        Graph.from<Named>([undefined], { path: 'name' });
      }, /Cannot add null or undefined to graph/);
    });

    it('throws on missing required path', () => {
      assert.throws(() => {
        Graph.from<{ id: string }>([{ id: 'test' }], { path: 'name' });
      }, /Node is missing required path 'name'/);
    });

    it('throws on null edge target', () => {
      const graph = new Graph<Named>({ path: 'name' });
      assert.throws(() => {
        graph.add(A, null);
      }, /Cannot add null or undefined to graph/);
    });

    it('throws on accessing non-existent node value', () => {
      const graph = Graph.from<Named>([A, B], { path: 'name' });
      assert.throws(() => {
        graph.value('Z');
      }, /Node with key 'Z' does not exist in graph/);
    });

    it('throws on accessing non-existent node edges', () => {
      const graph = Graph.from<Named>([A, B], { path: 'name' });
      assert.throws(() => {
        graph.edges('Z');
      }, /Node with key 'Z' does not exist in graph/);
    });

    it('throws on invalid sort mode', () => {
      const graph = Graph.from<Named>([A, B], { path: 'name' });
      assert.throws(() => {
        graph.sort(999 as SortModeEnum);
      }, /Invalid sort mode: 999/);
    });
  });
});
