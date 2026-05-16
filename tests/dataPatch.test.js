import { describe, it, expect } from 'vitest';
import { applyOp } from '../lib/dataPatchOps';

describe('applyOp', () => {
  it('set replaces a nested field', () => {
    const r = applyOp({ a: { b: 1 } }, { type: 'set', path: ['a', 'b'], value: 2 });
    expect(r).toEqual({ a: { b: 2 } });
  });

  it('set creates intermediate objects when missing', () => {
    const r = applyOp({}, { type: 'set', path: ['x', 'y', 'z'], value: 'hi' });
    expect(r).toEqual({ x: { y: { z: 'hi' } } });
  });

  it('merge combines target object with value', () => {
    const r = applyOp({ cfg: { a: 1, b: 2 } }, { type: 'merge', path: ['cfg'], value: { b: 99, c: 3 } });
    expect(r).toEqual({ cfg: { a: 1, b: 99, c: 3 } });
  });

  it('append pushes to an array', () => {
    const r = applyOp({ list: [1, 2] }, { type: 'append', path: ['list'], value: 3 });
    expect(r.list).toEqual([1, 2, 3]);
  });

  it('append initializes a missing array', () => {
    const r = applyOp({}, { type: 'append', path: ['list'], value: 1 });
    expect(r.list).toEqual([1]);
  });

  it('replaceById updates the matching element', () => {
    const state = { items: [{ id: 1, x: 'a' }, { id: 2, x: 'b' }] };
    const r = applyOp(state, { type: 'replaceById', path: ['items'], id: 2, value: { x: 'c' } });
    expect(r.items).toEqual([{ id: 1, x: 'a' }, { id: 2, x: 'c' }]);
  });

  it('removeById drops the matching element', () => {
    const state = { items: [{ id: 1 }, { id: 2 }, { id: 3 }] };
    const r = applyOp(state, { type: 'removeById', path: ['items'], id: 2 });
    expect(r.items).toEqual([{ id: 1 }, { id: 3 }]);
  });

  it('throws on unknown op type', () => {
    expect(() => applyOp({}, { type: 'wat', path: ['x'], value: 1 })).toThrow();
  });
});
