export const formatMessage = ({ options, message = '' }) =>
  `${formatPrefix(options.prefix())}${message}`;

export const formatExpected = ({ options, type, value, path = [] }) =>
  `${formatPrefix(options.prefix(), path.join('.'))}expected ${type} but got ${formatValue(value)}`;

export const throwMessage = ({ ...args }) => {
  throw new Error(formatMessage({ ...args }));
}
export const warnMessage = ({ ...args }, ...msg) => {
  console.warn(formatMessage({ ...args }), ...msg);
}
export const throwExpected = ({ ...args }) => {
  const msg = formatExpected({ ...args });
  throw new Error(msg);
}
export const warnExpected = ({ ...args }) => {
  const msg = formatExpected({ ...args });
  console.warn(msg);
}

export const errorMessage = ({ ...args }) => {
  console.error(formatMessage({ ...args }));
}
export const errorExpected = ({ ...args }) => {
  const msg = formatExpected({ ...args });
  console.error(msg);
}

export const formatValue = v => {
  const t = typeof v;
  if (v === null) return '[null]';
  if (t === 'undefined') return '[undefined]';
  if (t === 'boolean' || t === 'bigint') return `[${t} ${v}]`;
  if (t === 'number') return `[number ${Object.is(v, -0) ? '-0' : String(v)}]`;  // keep -0
  if (t === 'string') return v.length <= 32 ? `[string "${v}"]`
    : `[string "${v.slice(0, 29)}..." (${v.length})]`;
  if (t === 'symbol') return `[symbol ${v.description ? '(' + v.description + ')' : ''}]`;
  if (t === 'function') return `[function ${v.name || '<anonymous>'}]`;
  if (Array.isArray(v)) return `[array (${v.length})]`;
  const name = v.constructor?.name;
  return `[object ${name && name !== 'Object' ? name : 'Object'}]`;
}

export const formatPrefix = (...args) => args.flat(Infinity).filter(Boolean).map(a => a + ' ').join('');