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
        { key: 'name' }
      );
      const result = sort(graph, SortMode.Flat);
      assert.deepEqual(result.nodes, [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }, { name: 'E' }, { name: 'F' }, { name: 'G' }, { name: 'H' }]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles', () => {
      const graph = Graph.from([[{ name: 'A' }, { name: 'B' }], [{ name: 'B' }, { name: 'C' }], [{ name: 'D' }, { name: 'E' }], [{ name: 'E' }, { name: 'F' }], { name: 'H' }], { key: 'name' });
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
        { key: 'name' }
      );

      const result = sort(graph, SortMode.Flat);
      assert.deepEqual(result.nodes, [{ name: 'D' }, { name: 'E' }, { name: 'F' }]);
      assert.deepEqual(result.cycles, [[{ name: 'A' }, { name: 'B' }, { name: 'A' }]]);
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
        { key: 'name' }
      );
      const result = sort(graph, SortMode.Group);
      assert.deepEqual(result.nodes, [[{ name: 'A' }, { name: 'B' }], [{ name: 'C' }, { name: 'D' }], [{ name: 'E' }], [{ name: 'F' }, { name: 'G' }], [{ name: 'H' }]]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles', () => {
      const graph = Graph.from([[{ name: 'A' }, { name: 'B' }], [{ name: 'B' }, { name: 'C' }], [{ name: 'D' }, { name: 'E' }], [{ name: 'E' }, { name: 'F' }], { name: 'G' }], { key: 'name' });
      const result = sort(graph, SortMode.Group);
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
    });
  });
});
