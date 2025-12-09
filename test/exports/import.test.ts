import assert from 'assert';
import * as topo from 'topological-sort-group';
import Graph, { type DependencyGraph, SortMode } from 'topological-sort-group';

describe('exports .ts', () => {
  it('exports', () => {
    assert.equal(typeof topo.default, 'function');
    assert.equal(typeof topo.default.SortMode.Group, 'number');
    assert.equal(typeof topo.SortMode.Flat, 'number');
  });

  it('named exports', () => {
    assert.equal(typeof Graph, 'function');
    assert.equal(typeof Graph.SortMode.Group, 'number');
    assert.equal(typeof SortMode.Flat, 'number');
  });

  it('DependencyGraph type is usable', () => {
    const graph: DependencyGraph<string> = {
      nodes: { a: 'A', b: 'B' },
      dependencies: { a: [], b: ['a'] },
    };
    assert.ok(graph);
    assert.ok(graph.nodes);
    assert.ok(graph.dependencies);
  });
});
