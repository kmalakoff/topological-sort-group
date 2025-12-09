import assert from 'assert';

import Graph, { SortMode } from 'topological-sort-group';

describe('sort numbers', () => {
  describe('flat', () => {
    it('no cycles', () => {
      // Old: [1,3], [2,3], [2,4], [3,5], [4,6], [5,6], [5,7], [6,8]
      // Meaning: 3 depends on 1,2; 4 depends on 2; 5 depends on 3; 6 depends on 4,5; 7 depends on 5; 8 depends on 6
      const graph = Graph.from<number>({
        nodes: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8 },
        dependencies: {
          '1': [],
          '2': [],
          '3': ['1', '2'],
          '4': ['2'],
          '5': ['3'],
          '6': ['4', '5'],
          '7': ['5'],
          '8': ['6'],
        },
      });
      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, [1, 2, 3, 4, 5, 6, 7, 8]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles with isolated node', () => {
      // Old: [1,2], [2,3], [4,5], [5,6], 8
      // Meaning: 2 depends on 1; 3 depends on 2; 5 depends on 4; 6 depends on 5; 8 is isolated
      const graph = Graph.from<number>({
        nodes: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '8': 8 },
        dependencies: {
          '1': [],
          '2': ['1'],
          '3': ['2'],
          '4': [],
          '5': ['4'],
          '6': ['5'],
          '8': [],
        },
      });
      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, [1, 4, 8, 2, 5, 3, 6]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      // Original: [1,2], [2,3], [4,5], [5,6], [2,1]
      // 1 <-> 2 creates a cycle, 3 depends on 2, 4 -> 5 -> 6 (no cycle)
      const graph = Graph.from<number>({
        nodes: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6 },
        dependencies: {
          '1': ['2'], // 1 depends on 2 (from [2, 1])
          '2': ['1'], // 2 depends on 1 (from [1, 2]) - creates cycle
          '3': ['2'], // 3 depends on 2 (from [2, 3])
          '4': [],
          '5': ['4'], // 5 depends on 4 (from [4, 5])
          '6': ['5'], // 6 depends on 5 (from [5, 6])
        },
      });

      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, [4, 5, 6]);
      assert.deepEqual(result.cycles, [[1, 2, 1]]);
    });
  });

  describe('group', () => {
    it('no cycles', () => {
      const graph = Graph.from<number>({
        nodes: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8 },
        dependencies: {
          '1': [],
          '2': [],
          '3': ['1', '2'],
          '4': ['2'],
          '5': ['3'],
          '6': ['4', '5'],
          '7': ['5'],
          '8': ['6'],
        },
      });
      const result = graph.sort();
      assert.deepEqual(result.nodes, [[1, 2], [3, 4], [5], [6, 7], [8]]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles with isolated node', () => {
      const graph = Graph.from<number>({
        nodes: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7 },
        dependencies: {
          '1': [],
          '2': ['1'],
          '3': ['2'],
          '4': [],
          '5': ['4'],
          '6': ['5'],
          '7': [],
        },
      });
      const result = graph.sort();
      assert.deepEqual(result.nodes, [
        [1, 4, 7],
        [2, 5],
        [3, 6],
      ]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      const graph = Graph.from<number>({
        nodes: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6 },
        dependencies: {
          '1': ['2'], // 1 depends on 2 (from [2, 1])
          '2': ['1'], // 2 depends on 1 (from [1, 2]) - creates cycle
          '3': ['2'], // 3 depends on 2 (from [2, 3])
          '4': [],
          '5': ['4'], // 5 depends on 4 (from [4, 5])
          '6': ['5'], // 6 depends on 5 (from [5, 6])
        },
      });

      const result = graph.sort();
      assert.deepEqual(result.nodes, [[4], [5], [6]]);
      assert.deepEqual(result.cycles, [[1, 2, 1]]);
    });
  });
});
