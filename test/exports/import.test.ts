import assert from 'assert';
// @ts-ignore
import * as topo from 'topological-sort-group';
// @ts-ignore
import { cycles, Graph, SortMode, sort } from 'topological-sort-group';

describe('exports .ts', () => {
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
