const assert = require('assert');
const topo = require('topological-sort-group');
const Graph = require('topological-sort-group');
const { SortMode } = require('topological-sort-group');

describe('exports .ts', () => {
  it('exports', () => {
    assert.equal(typeof topo, 'function');
    assert.equal(typeof topo.SortMode.Flat, 'number');
  });

  it('named exports', () => {
    assert.equal(typeof Graph, 'function');
    assert.equal(typeof Graph.SortMode.Group, 'number');
    assert.equal(typeof SortMode.Flat, 'number');
  });
});
