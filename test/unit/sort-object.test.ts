import assert from 'assert';

// @ts-ignore
import { Graph, SortMode, sort } from 'topological-sort-group';

describe('sort object', () => {
  describe('flat', () => {
    it('no cycles', () => {
      const graph = Graph.from(
        [
          [{ name: 'A' }, { name: 'C' }],
          [{ name: 'B' }, { name: 'C' }],
          [{ name: 'B' }, { name: 'D' }],
          [{ name: 'C' }, { name: 'E' }],
          [{ name: 'D' }, { name: 'F' }],
          [{ name: 'E' }, { name: 'F' }],
          [{ name: 'E' }, { name: 'G' }],
          [{ name: 'F' }, { name: 'H' }],
        ],
        { path: 'name' }
      );
      const result = sort(graph, SortMode.Flat);
      assert.deepEqual(result.nodes, [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }, { name: 'E' }, { name: 'F' }, { name: 'G' }, { name: 'H' }]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles', () => {
      const graph = Graph.from([[{ name: 'A' }, { name: 'B' }], [{ name: 'B' }, { name: 'C' }], [{ name: 'D' }, { name: 'E' }], [{ name: 'E' }, { name: 'F' }], { name: 'H' }], { path: 'name' });
      const result = sort(graph, SortMode.Flat);
      assert.deepEqual(result.nodes, [{ name: 'A' }, { name: 'D' }, { name: 'H' }, { name: 'B' }, { name: 'E' }, { name: 'C' }, { name: 'F' }]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const graph = Graph.from(
        [
          [{ name: 'A' }, { name: 'B' }],
          [{ name: 'B' }, { name: 'C' }],
          [{ name: 'D' }, { name: 'E' }],
          [{ name: 'E' }, { name: 'F' }],
          [{ name: 'B' }, { name: 'A' }], // Creates a cycle
        ],
        { path: 'name' }
      );

      const result = sort(graph, SortMode.Flat);
      assert.deepEqual(result.nodes, [{ name: 'D' }, { name: 'E' }, { name: 'F' }]);
      assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
    });
  });
  describe('group', () => {
    it('no cycles', () => {
      const graph = Graph.from(
        [
          [{ name: 'A' }, { name: 'C' }],
          [{ name: 'B' }, { name: 'C' }],
          [{ name: 'B' }, { name: 'D' }],
          [{ name: 'C' }, { name: 'E' }],
          [{ name: 'D' }, { name: 'F' }],
          [{ name: 'E' }, { name: 'F' }],
          [{ name: 'E' }, { name: 'G' }],
          [{ name: 'F' }, { name: 'H' }],
        ],
        { path: 'name' }
      );
      const result = sort(graph);
      assert.deepEqual(result.nodes, [[{ name: 'A' }, { name: 'B' }], [{ name: 'C' }, { name: 'D' }], [{ name: 'E' }], [{ name: 'F' }, { name: 'G' }], [{ name: 'H' }]]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles', () => {
      const graph = Graph.from([[{ name: 'A' }, { name: 'B' }], [{ name: 'B' }, { name: 'C' }], [{ name: 'D' }, { name: 'E' }], [{ name: 'E' }, { name: 'F' }], { name: 'G' }], { path: 'name' });
      const result = sort(graph);
      assert.deepEqual(result.nodes, [
        [{ name: 'A' }, { name: 'D' }, { name: 'G' }],
        [{ name: 'B' }, { name: 'E' }],
        [{ name: 'C' }, { name: 'F' }],
      ]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles - strict', () => {
      try {
        const _graph = Graph.from([[{ name: 'A' }, { name: 'B' }], [{ name: 'B' }, { name: 'C' }], [{ name: 'D' }, { name: 'E' }], [{ name: 'E' }, { name: 'F' }], { name: 'G' }], { path: 'name', strict: true });
        assert.ok(false);
      } catch (err) {
        assert.ok(!!err);
      }

      const graph = Graph.from([[{ name: 'A' }, { name: 'B' }], ['B', { name: 'C' }], [{ name: 'D' }, { name: 'E' }], ['E', { name: 'F' }], { name: 'G' }], { path: 'name', strict: true });
      const result = sort(graph);
      assert.deepEqual(result.nodes, [
        [{ name: 'A' }, { name: 'D' }, { name: 'G' }],
        [{ name: 'B' }, { name: 'E' }],
        [{ name: 'C' }, { name: 'F' }],
      ]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
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
    });
  });
});
