import assert from 'assert';

// @ts-ignore
import Graph, { SortMode } from 'topological-sort-group';

describe('sort strings', () => {
  describe('flat', () => {
    it('no cycles', () => {
      const graph = Graph.from<string>([
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
    });

    it('no cycles', () => {
      const graph = Graph.from<string>([['A', 'B'], ['B', 'C'], ['D', 'E'], ['E', 'F'], 'H']);
      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, ['A', 'D', 'H', 'B', 'E', 'C', 'F']);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const graph = Graph.from<string>([
        ['A', 'B'],
        ['B', 'C'],
        ['D', 'E'],
        ['E', 'F'],
        ['B', 'A'], // Creates a cycle
      ]);

      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, ['D', 'E', 'F']);
      assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
    });
  });
  describe('group', () => {
    it('no cycles', () => {
      const graph = Graph.from<string>([
        ['A', 'C'],
        ['B', 'C'],
        ['B', 'D'],
        ['C', 'E'],
        ['D', 'F'],
        ['E', 'F'],
        ['E', 'G'],
        ['F', 'H'],
      ]);
      const result = graph.sort();
      assert.deepEqual(result.nodes, [['A', 'B'], ['C', 'D'], ['E'], ['F', 'G'], ['H']]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles', () => {
      const graph = Graph.from<string>([['A', 'B'], ['B', 'C'], ['D', 'E'], ['E', 'F'], 'G']);
      const result = graph.sort();
      assert.deepEqual(result.nodes, [
        ['A', 'D', 'G'],
        ['B', 'E'],
        ['C', 'F'],
      ]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const graph = Graph.from<string>([
        ['A', 'B'],
        ['B', 'C'],
        ['D', 'E'],
        ['E', 'F'],
        ['B', 'A'], // Creates a cycle
      ]);

      const result = graph.sort();
      assert.deepEqual(result.nodes, [['D'], ['E'], ['F']]);
      assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
    });
  });
});
