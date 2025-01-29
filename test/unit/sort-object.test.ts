import assert from 'assert';

// @ts-ignore
import { Graph, SortMode, sort } from 'topological-sort-group';

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
      const graph = Graph.from(
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
      const result = sort(graph, SortMode.Flat);
      assert.deepEqual(result.nodes, [A, B, C, D, E, F, G, H]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles', () => {
      const graph = Graph.from([[A, B], [B, C], [D, E], [E, F], H], { path: 'name' });
      const result = sort(graph, SortMode.Flat);
      assert.deepEqual(result.nodes, [A, D, H, B, E, C, F]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const graph = Graph.from(
        [
          [A, B],
          [B, C],
          [D, E],
          [E, F],
          [B, A], // Creates a cycle
        ],
        { path: 'name' }
      );

      const result = sort(graph, SortMode.Flat);
      assert.deepEqual(result.nodes, [D, E, F]);
      assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
    });
  });
  describe('group', () => {
    it('no cycles', () => {
      const graph = Graph.from(
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
      const result = sort(graph);
      assert.deepEqual(result.nodes, [[A, B], [C, D], [E], [F, G], [H]]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles', () => {
      const graph = Graph.from([[A, B], [B, C], [D, E], [E, F], G], { path: 'name' });
      const result = sort(graph);
      assert.deepEqual(result.nodes, [
        [A, D, G],
        [B, E],
        [C, F],
      ]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const graph = Graph.from(
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

      const result = sort(graph);
      assert.deepEqual(result.nodes, [[{ package: D }], [{ package: E }], [{ package: F }]]);
      assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
    });
  });
  describe('errors', () => {
    it('no cycles', () => {
      try {
        const _graph = Graph.from(
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
        assert.ok(false);
      } catch (err) {
        assert.ok(!!err);
      }
    });
  });
});
