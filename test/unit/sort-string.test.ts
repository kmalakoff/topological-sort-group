import assert from 'assert';

import Graph, { SortMode } from 'topological-sort-group';

describe('sort strings', () => {
  describe('flat', () => {
    it('no cycles', () => {
      // Old: [A,C], [B,C], [B,D], [C,E], [D,F], [E,F], [E,G], [F,H]
      // Meaning: C depends on A,B; D depends on B; E depends on C; F depends on D,E; G depends on E; H depends on F
      const graph = Graph.from<string>({
        nodes: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H' },
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
      assert.deepEqual(result.nodes, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles with isolated node', () => {
      // Old: [A,B], [B,C], [D,E], [E,F], H
      // Meaning: B depends on A; C depends on B; E depends on D; F depends on E; H is isolated
      const graph = Graph.from<string>({
        nodes: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', H: 'H' },
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
      assert.deepEqual(result.nodes, ['A', 'D', 'H', 'B', 'E', 'C', 'F']);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      // A <-> B creates a cycle, C depends on B, D -> E -> F (no cycle)
      // Original: [A,B], [B,C], [D,E], [E,F], [B,A]
      // Meaning: B depends on A, C depends on B, E depends on D, F depends on E, A depends on B (cycle)
      const graph = Graph.from<string>({
        nodes: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F' },
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
      assert.deepEqual(result.nodes, ['D', 'E', 'F']);
      assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
    });
  });

  describe('group', () => {
    it('no cycles', () => {
      const graph = Graph.from<string>({
        nodes: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H' },
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
      assert.deepEqual(result.nodes, [['A', 'B'], ['C', 'D'], ['E'], ['F', 'G'], ['H']]);
      assert.deepEqual(result.cycles, []);
    });

    it('no cycles with isolated node', () => {
      const graph = Graph.from<string>({
        nodes: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G' },
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
        ['A', 'D', 'G'],
        ['B', 'E'],
        ['C', 'F'],
      ]);
      assert.deepEqual(result.cycles, []);
    });

    it('with cycles', () => {
      // Original: [A,B], [B,C], [D,E], [E,F], [B,A]
      const graph = Graph.from<string>({
        nodes: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F' },
        dependencies: {
          A: ['B'], // A depends on B (from [B, A])
          B: ['A'], // B depends on A (from [A, B]) - creates cycle
          C: ['B'], // C depends on B (from [B, C])
          D: [],
          E: ['D'], // E depends on D (from [D, E])
          F: ['E'], // F depends on E (from [E, F])
        },
      });

      const result = graph.sort();
      assert.deepEqual(result.nodes, [['D'], ['E'], ['F']]);
      assert.deepEqual(result.cycles, [['A', 'B', 'A']]);
    });
  });

  describe('addNode and addDependency API', () => {
    it('builds graph incrementally', () => {
      const graph = new Graph<string>();
      graph.addNode('A', 'A');
      graph.addNode('B', 'B');
      graph.addNode('C', 'C');
      graph.addDependency('B', 'A'); // B depends on A
      graph.addDependency('C', 'B'); // C depends on B

      const result = graph.sort(SortMode.Flat);
      assert.deepEqual(result.nodes, ['A', 'B', 'C']);
    });

    it('toGraph exports correctly', () => {
      const graph = new Graph<string>();
      graph.addNode('A', 'A');
      graph.addNode('B', 'B');
      graph.addDependency('B', 'A');

      const exported = graph.toGraph();
      assert.deepEqual(exported.nodes, { A: 'A', B: 'B' });
      assert.deepEqual(exported.dependencies, { A: [], B: ['A'] });
    });

    it('round-trips through from/toGraph', () => {
      const input = {
        nodes: { A: 'A', B: 'B', C: 'C' },
        dependencies: { A: [], B: ['A'], C: ['A', 'B'] },
      };
      const graph = Graph.from<string>(input);
      const output = graph.toGraph();

      assert.deepEqual(output.nodes, input.nodes);
      // Dependencies might be in different order, so sort them
      for (const key in output.dependencies) {
        output.dependencies[key].sort();
      }
      for (const key in input.dependencies) {
        input.dependencies[key].sort();
      }
      assert.deepEqual(output.dependencies, input.dependencies);
    });
  });
});
