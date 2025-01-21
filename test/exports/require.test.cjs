const assert = require('assert');
const topo = require('topological-sort-group');
const { Graph, cycles, sort, SortMode } = require('topological-sort-group');

describe('exports .cjs', () => {
  it('exports', () => {
    assert.equal(typeof topo.Graph, 'function');
    assert.equal(typeof topo.cycles, 'function');
    assert.equal(typeof topo.sort, 'function');
    assert.equal(typeof topo.SortMode.Flat, 'number');
  });

  it('named exports', () => {
    assert.equal(typeof Graph, 'function');
    assert.equal(typeof cycles, 'function');
    assert.equal(typeof sort, 'function');
    assert.equal(typeof SortMode.Flat, 'number');
  });
});
