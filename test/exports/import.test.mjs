import assert from 'assert';
import * as topo from 'topological-sort-group';
import { Graph, SortMode, cycles, sort } from 'topological-sort-group';

describe('exports .mjs', () => {
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
