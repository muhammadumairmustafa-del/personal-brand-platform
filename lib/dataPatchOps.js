// Pure operation-applier used by /api/data/[key]/patch. Extracted so it can be
// unit-tested without spinning up a route handler.

const getDeep = (obj, keys) => keys.reduce(
  (o, k) => (o && typeof o === 'object' ? o[k] : undefined),
  obj
);

const setDeep = (obj, keys, val) => {
  if (keys.length === 0) return val;
  const [head, ...rest] = keys;
  const next = obj && typeof obj === 'object' ? { ...obj } : {};
  next[head] = setDeep(next[head], rest, val);
  return next;
};

export function applyOp(current, op) {
  if (!op || typeof op !== 'object') throw new Error('Invalid op');
  const { type, path, value, id } = op;
  const segs = Array.isArray(path) ? path : [];

  switch (type) {
    case 'set':
      return setDeep(current, segs, value);
    case 'merge': {
      const target = getDeep(current, segs);
      const merged = { ...(target && typeof target === 'object' ? target : {}), ...(value || {}) };
      return setDeep(current, segs, merged);
    }
    case 'append': {
      const target = getDeep(current, segs);
      const arr = Array.isArray(target) ? target : [];
      return setDeep(current, segs, [...arr, value]);
    }
    case 'replaceById': {
      const target = getDeep(current, segs);
      const arr = Array.isArray(target) ? target : [];
      return setDeep(current, segs, arr.map((it) => (it?.id === id ? { ...it, ...value } : it)));
    }
    case 'removeById': {
      const target = getDeep(current, segs);
      const arr = Array.isArray(target) ? target : [];
      return setDeep(current, segs, arr.filter((it) => it?.id !== id));
    }
    default:
      throw new Error(`Unknown op type: ${type}`);
  }
}
