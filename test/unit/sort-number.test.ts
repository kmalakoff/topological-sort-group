import assert from 'assert';

// @ts-ignore
import { Graph, SortMode, sort } from 'topological-sort-group';

describe('sort numbers', () => {
  describe('flat', () => {
    it('no cycles', () => {
      const graph = Graph.from([
        [1, 3],
        [2, 3],
        [2, 4],
        [3, 5],
        [4, 6],
        [5, 6],
        [5, 7],
        [6, 8],
      ]);
      const result = sort(graph, SortMode.Flat);
      assert.deepEqual(result.nodes, [1, 2, 3, 4, 5, 6, 7, 8]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles', () => {
      const graph = Graph.from([[1, 2], [2, 3], [4, 5], [5, 6], 8]);
      const result = sort(graph, SortMode.Flat);
      assert.deepEqual(result.nodes, [1, 4, 8, 2, 5, 3, 6]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const graph = Graph.from([
        [1, 2],
        [2, 3],
        [4, 5],
        [5, 6],
        [2, 1], // Creates a cycle
      ]);

      const result = sort(graph, SortMode.Flat);
      assert.deepEqual(result.nodes, [4, 5, 6]);
      assert.deepEqual(result.cycles, [[1, 2, 1]]);
    });
  });
  describe('group', () => {
    it('no cycles', () => {
      const graph = Graph.from([
        [1, 3],
        [2, 3],
        [2, 4],
        [3, 5],
        [4, 6],
        [5, 6],
        [5, 7],
        [6, 8],
      ]);
      const result = sort(graph);
      assert.deepEqual(result.nodes, [[1, 2], [3, 4], [5], [6, 7], [8]]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles', () => {
      const graph = Graph.from([[1, 2], [2, 3], [4, 5], [5, 6], 7]);
      const result = sort(graph);
      assert.deepEqual(result.nodes, [
        [1, 4, 7],
        [2, 5],
        [3, 6],
      ]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const graph = Graph.from([
        [1, 2],
        [2, 3],
        [4, 5],
        [5, 6],
        [2, 1], // Creates a cycle
      ]);

      const result = sort(graph);
      assert.deepEqual(result.nodes, [[4], [5], [6]]);
      assert.deepEqual(result.cycles, [[1, 2, 1]]);
    });
  });
});
