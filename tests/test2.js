#!/usr/bin/env node
/* eslint-disable no-console */
import { withTypeCheckers } from '../with-type-checkers.js';

import { describe, it, assert, assertThrows, assertDoesNotThrow, report } from './tiny-test.js';


// --------------------------------------------------
// 2.  Test subjects
// --------------------------------------------------
class Sample extends withTypeCheckers() {
  double(x) {
    this.assert.is.number(x, 'x');
    return x * 2;
  }

  maybeString(x) {
    this.check.is.string(x, 'x');
    return x;
  }
}

// --------------------------------------------------
// 3.  Actual test suite
// --------------------------------------------------
describe('with-type-checkers', () => {

  describe('Basic type detection', () => {
    const s = new Sample();

    it('recognises strings', () => assert(s.is('string', 'hello')));
    it('recognises numbers', () => assert(s.is('number', 42)));
    it('rejects arrays as plain objects', () => assert(!s.is('plainObject', [])));
    it('accepts real plain objects', () => assert(s.is('plainObject', { a: 1 })));
  });

  describe('Union types', () => {
    const s = new Sample();
    it('accepts string|number', () => assert(s.is('string|number', 'x')));
    it('accepts string|number (number)', () => assert(s.is('string|number', 7)));
    it('rejects boolean for string|number', () => assert(!s.is('string|number', true)));
  });

  describe('assert.*', () => {
    const s = new Sample();
  it('throws on wrong type', () =>
    assertThrows(() => s.double('not a number'), 'x expected number but got not a number'));

    it('returns on correct type', () =>
      assert(s.double(3) === 6));
  });

  describe('check.* (warnings only)', () => {
    const s = new Sample();
    it('does not throw', () =>
      assertDoesNotThrow(() => s.maybeString(123)));
  });

  describe('Static API', () => {
    it('works on class itself', () =>
      assert(Sample.is('boolean', true)));
  });

  describe('Custom error labels', () => {
    class Foo extends withTypeCheckers() {
      bar(x) { this.assert.is.array(x, 'Items'); }
    }
    it('uses custom label', () =>
      assertThrows(() => new Foo().bar('nope'), 'Items expected array'));
  });

});

// --------------------------------------------------
// 4.  Run & report
// --------------------------------------------------
if (process.argv.includes('--tap')) {
  // Minimal TAP output for CI
  console.log('TAP version 13');
  console.log(`1..${total}`);
  let i = 0;
  const originalIt = it;
  global.it = (t, f) => {
    i++;
    try { f(); console.log(`ok ${i} ${t}`); }
    catch (e) { console.log(`not ok ${i} ${t}`); }
  };
  require.main.exports; // re-run suite
  process.exit(failed ? 1 : 0);
} else {
  report();
}