import { defaultTypeCheckers } from "./defaultTypeCheckers.js";
import { formatMessage, formatValue, formatExpected, throwExpected, throwMessage, warnMessage } from "./formatMessage.js";

function undot_shallow(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj.constructor && obj.constructor !== Object) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const keys = k.split('.');
    const last = keys.pop();
    let target = out;
    for (const key of keys) target = target[key] ??= {};
    target[last] = v;
  }
  return out;
}

function undot_deep(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj.constructor && obj.constructor !== Object) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const keys = k.split('.');
    const last = keys.pop();
    let target = out;
    for (const key of keys) target = target[key] ??= {};
    target[last] = v ? undot_deep(v) : v;
  }
  return out;
}

/* -------------- 2.  factory -------------- */

const applyCheckerContext = function (typeCheckers,ctx, {undot:undotMode,...options}) {
  const isProto = {};
  for (const type in typeCheckers) {
    const checker = typeCheckers[type];
    isProto[type] = function (value, desc) {
      return this._fn(checker(value), { type, value,  path: [desc ?? ''] });
    };
  }

  const undot = 
    undotMode == 'deep' ? undot_deep 
    : undotMode == 'shallow' ? undot_shallow 
    : v=>v;

  // ---- new walker factory ----
  const makeIsType = fn => {
    function walk(type, value, path = []) {
      if (typeof type === 'string') {
        const ok = type.split('|').some(t => typeCheckers[t]?.(value));
        if (!fn(ok, { type, value, path })) return false;
        return ok;
      }
      if (Array.isArray(type)) {
        if (!Array.isArray(value)) return false;
        if (type.length !== 1) throwMessage(options, 'array type checkers must be of length 1');
        const [t] = type;
        return value.every((v, i) => walk(t, v, [...path, i]));
      }
      if (type && typeof type === 'object') {
        if (typeof value !== 'object' || value === null) return false;
        const v = undot(value);
        return Object.keys(type).every(k => walk(type[k], v[k], [...path, k]));
      }
      if (typeof type === 'function') {
        return fn(type(value), { type, value, path });
      }
    }
    return walk
  }

  const makeIs = (fn) => {
    const isType = makeIsType(fn);
    const handler = (type, value, desc) => fn(isType(type, value, [desc ?? '']), { type, value, path: [desc ?? ''] });
    Object.assign(handler, isProto, { _fn: fn });
    return handler;
  }


  ctx.is = makeIs(ok => ok);
  ctx.is.not = makeIs(ok => !ok);

  // generic assert
  ctx.assert = (ok, message) => {
    if (!ok) throwMessage({ options, message });
  }
  ctx.assert.not = (ok, message) => {
    if (ok) throwMessage({ options, message });
  }
  // per type assert, we will call expectedThrow
  ctx.assert.is = makeIs((ok, { type, value, path }) => {
    if (!ok) throwExpected({ value, path, type, options });
    return true;
  });
  ctx.assert.is.not = makeIs((ok, { type, value, path }) => {
    if (ok) throwExpected({ value, path, type: 'not ' + type, options });
    return true;
  });

  ctx.check = (ok, message) => {
    if (!ok) console.warn(formatMessage({ options, message }));
  }
  ctx.check.not = (ok, message) => {
    if (ok) console.warn(formatMessage({ options, message }));
  }

  ctx.check.is = makeIs((ok, { type, value, path }) => {
    if (!ok) console.warn(formatExpected({ options, type, value, path }));
    return true;
  });
  ctx.check.is.not = makeIs((ok, { type, value, path }) => {
    if (ok) console.warn(formatExpected({ options, type, value, path }));
    return true;
  });

  ctx.log = (...args) => console.log(...options.prefix(), ...args);
  ctx.warn = (...args) => warnMessage({ options }, ...args);
  ctx.error = message => console.error(formatMessage({ options, message }));
  ctx.debug = message => console.debug(formatMessage({ options, message }));
  ctx.throw = message => throwMessage({ options, message });

}
export function createWithTypeCheckers(extraTypeCheckers = {}) {
  const typeCheckers = { ...defaultTypeCheckers, ...extraTypeCheckers };


  /* ---- 2f. the returned mixin factory ---- */
  return function (ClassOrOptions = {}, maybeOptions) {
    // both arguments are optional
    // supply a class for mixins, optionally skip for creating a base class
    const [Class, allOptions] = typeof ClassOrOptions === 'function'
      ? [ClassOrOptions, maybeOptions ?? {}]
      : [class { }, ClassOrOptions ?? {}];

    let { classPrefix = Class.name ?? 'typecheck', instancePrefix = null, ...options } = allOptions;

    if (typeof classPrefix === 'function') classPrefix = classPrefix();
    if (typeof instancePrefix === 'string') instancePrefix = instance => instance[instancePrefix];

    return class extends Class {
      static {
        applyCheckerContext(typeCheckers,this, {
          ...options,
          prefix: () => [classPrefix],
        });
      }
      constructor(...args) {
        super(...args);
        applyCheckerContext(typeCheckers,this, {
          ...options,
          prefix: () => [classPrefix, instancePrefix?.call(this, this)],
        });
      }
    };
  }
}

/* -------------- 3.  default export -------------- */
export const withTypeCheckers = createWithTypeCheckers();
export default withTypeCheckers;