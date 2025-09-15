/* -------------- 1.  built-in checkers -------------- */
const AsyncFunction = (async () => { }).constructor;

const defaultTypeCheckers = {
  object: v => typeof v === 'object' && v !== null && !Array.isArray(v),
  plainObject: v => Object.prototype.toString.call(v) === '[object Object]',
  string: v => typeof v === 'string',
  number: v => typeof v === 'number' && !isNaN(v),
  boolean: v => typeof v === 'boolean',
  function: v => typeof v === 'function',
  array: v => Array.isArray(v),
  null: v => v === null,
  undefined: v => typeof v === 'undefined',
  none: v => v === null || typeof v === 'undefined',
  symbol: v => typeof v === 'symbol',
  bigint: v => typeof v === 'bigint',
  date: v => v instanceof Date && !isNaN(v),
  regexp: v => v instanceof RegExp,
  error: v => v instanceof Error,
  promise: v => v instanceof Promise || (v && typeof v.then === 'function' && typeof v.catch === 'function'),
  set: v => v instanceof Set,
  map: v => v instanceof Map,
  weakset: v => v instanceof WeakSet,
  weakmap: v => v instanceof WeakMap,
  iterable: v => typeof v === 'object' && v !== null && typeof v[Symbol.iterator] === 'function',
  numeric: v => !isNaN(parseFloat(v)) && isFinite(v),
  emptyString: v => typeof v === 'string' && v.length === 0,
  notEmptyString: v => typeof v === 'string' && v.length > 0,
  emptyArray: v => Array.isArray(v) && v.length === 0,
  notEmptyArray: v => Array.isArray(v) && v.length > 0,
  falsy: v => !v,
  truthy: v => !!v,
  primitive: v => v === null || (typeof v !== 'object' && typeof v !== 'function'),
  asyncFunction: v => typeof v === 'function' && v instanceof AsyncFunction,
  syncFunction: v => typeof v === 'function' && !(v instanceof AsyncFunction),
};

/* -------------- 2.  factory -------------- */
export function createWithTypeCheckers(extraCheckers = {}) {
  /* ---- 2a. final checker set ---- */
  const typeCheckers = { ...defaultTypeCheckers, ...extraCheckers };

  /* ---- 2b. checker prototype ---- */
  const checkerProto = Object.create(null);
  for (const type in typeCheckers) {
    const checker = typeCheckers[type];
    checkerProto[type] = function (value, desc) {

      this._handler(checker(value), { desc, type, value });
    };
  }

  const _msg = ({ type, value, desc }) => {
    const msg = `${desc} expected ${type} but got ${String(value)}`;
    return msg;
  }

  /* ---- 2c. core helpers ---- */
  const is = (type, value) => {
    if (typeof type === 'string') return type.split('|').some(t => typeCheckers[t]?.(value));
    if (Array.isArray(type)) {
      if (!Array.isArray(value)) return false;
      if (type.length !== 1) throw new Error(prefix + 'array type checkers must be of length 1');
      const [t] = type;
      return value.every(v => is(t, v));
    }
    if (type && typeof type === 'object') {
      if (typeof value !== 'object' || value === null) return false;
      for (const k in type) {
        if (!is(type[k], value[k])) return false;
      }
      return true;
    }
  }
  is.not = (type, value) => !is(type, value);



  /* ---- 2d. binders ---- */
  const _assert = (prefix, cond, msg) => { if (!cond) throw new Error(prefix + _msg(msg)); };
  const _assertNot = (prefix, cond, msg) => { if (cond) throw new Error(prefix + _msg({ ...msg, type: 'not ' + msg.type })); };
  const _check = (prefix, cond, msg) => { if (!cond) console.warn(prefix + _msg(msg)); };
  const _checkNot = (prefix, cond, msg) => { if (cond) console.warn(prefix + _msg({ ...msg, type: 'not ' + msg.type })); };

  const bindChecker = (ctx, prefix, fn, fnNot) => {
    const handler = fn.bind(ctx, prefix);
    handler.is = Object.create(checkerProto);
    handler.is._handler = handler;
    handler.is.not = Object.create(checkerProto);
    handler.is.not._handler = fnNot.bind(ctx, prefix);
    return handler;
  };

  /* ---- 2e. context installer ---- */
  const applyCheckerContext = (ctx, prefix) => {
    ctx.is = is;
    ctx.assert = bindChecker(ctx, prefix, _assert, _assertNot);
    ctx.check = bindChecker(ctx, prefix, _check, _checkNot);
    ctx.log = console.log.bind(console, prefix);
    ctx.warn = msg => console.warn(prefix + msg);
    ctx.error = msg => console.error(prefix + msg);
    ctx.debug = msg => console.debug(prefix + msg);
    ctx.throw = msg => { throw new Error(prefix + msg); };
  };

  /* ---- 2f. the returned mixin factory ---- */



  return function (ClassOrOptions = {}, maybeOptions) {
    // both arguments are optional
    // supply a class for mixins, optionally skip for creating a base class
    const [Class, options] = typeof ClassOrOptions === 'function'
      ? [ClassOrOptions, maybeOptions ?? {}]
      : [class { }, ClassOrOptions ?? {}];

    let { classPrefix = Class.name ?? 'typecheck', instancePrefix = null } = options;

    return class extends Class {
      static {
        applyCheckerContext(this, classPrefix + ' ');
      }
      constructor(...args) {
        super(...args);
        const thisPrefix = [classPrefix, instancePrefix?.call(this, this)]
          .filter(Boolean)
          .map(p => p + ' ')
          .join('');
        applyCheckerContext(this, thisPrefix);
      }
    };
  }
}

/* -------------- 3.  default export -------------- */
export const withTypeCheckers = createWithTypeCheckers();
export default withTypeCheckers;