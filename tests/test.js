#!/usr/bin/env node
import { withTypeCheckers, createWithTypeCheckers } from '../with-type-checkers.js';
import { describe, it, assert, assertThrows, assertDoesNotThrow, report } from './tiny-test.js';

describe('with-type-checkers - Comprehensive Tests', () => {

  describe('Basic Type Assertions', () => {
    const TestClass = withTypeCheckers();
    const instance = new TestClass();

    // Test each type checker
    const testCases = [
      ['string', 'hello', true],
      ['string', 123, false],
      ['number', 42, true],
      ['number', '42', false],
      ['boolean', true, true],
      ['boolean', 'true', false],
      ['object', {}, true],
      ['object', null, false],
      ['object', [], false], // Arrays are not plain objects
      ['array', [], true],
      ['array', {}, false],
      ['function', () => {}, true],
      ['function', '() => {}', false],
      ['null', null, true],
      ['null', undefined, false],
      ['undefined', undefined, true],
      ['undefined', null, false],
      ['none', null, true],
      ['none', undefined, true],
      ['none', 0, false],
      ['symbol', Symbol(), true],
      ['symbol', 'symbol', false],
      ['bigint', 42n, true],
      ['bigint', 42, false],
      ['date', new Date(), true],
      ['date', '2023-01-01', false],
      ['regexp', /abc/, true],
      ['regexp', 'abc', false],
      ['error', new Error(), true],
      ['error', 'error', false],
      ['promise', Promise.resolve(), true],
      ['promise', {}, false],
      ['set', new Set(), true],
      ['set', [], false],
      ['map', new Map(), true],
      ['map', {}, false],
      ['iterable', [], true], // Arrays are iterable
      ['iterable', {}, false], // Plain objects are not iterable
      ['numeric', '42', true],
      ['numeric', 42, true],
      ['numeric', 'abc', false],
      ['emptyString', '', true],
      ['emptyString', 'hello', false],
      ['notEmptyString', 'hello', true],
      ['notEmptyString', '', false],
      ['emptyArray', [], true],
      ['emptyArray', [1], false],
      ['notEmptyArray', [1], true],
      ['notEmptyArray', [], false],
      ['falsy', false, true],
      ['falsy', '', true],
      ['falsy', 'hello', false],
      ['truthy', 'hello', true],
      ['truthy', 1, true],
      ['truthy', '', false],
      ['primitive', 'hello', true],
      ['primitive', 42, true],
      ['primitive', {}, false],
    ];

    testCases.forEach(([type, value, expected]) => {
      it(`${type} checker with ${String(value)}`, () => {
        assert(instance.is(type, value) === expected);
      });
    });
  });

  describe('Union Types', () => {
    const TestClass = withTypeCheckers();
    const instance = new TestClass();

    it('handles string|number union', () => {
      assert(instance.is('string|number', 'hello'));
      assert(instance.is('string|number', 42));
      assert(!instance.is('string|number', true));
    });

    it('handles multiple type unions', () => {
      assert(instance.is('string|number|boolean', 'hello'));
      assert(instance.is('string|number|boolean', 42));
      assert(instance.is('string|number|boolean', true));
      assert(!instance.is('string|number|boolean', null));
    });
  });

  describe('Assertion Methods', () => {
    class TestClass extends withTypeCheckers() {
      testMethod(value) {
        this.assert.is.string(value, 'value');
      }
    }
    const instance = new TestClass();

    it('throws on type mismatch', () => {
      assertThrows(
        () => instance.testMethod(42),
        'value expected string but got [number 42]'
      );
    });

    it('does not throw on correct type', () => {
      assertDoesNotThrow(() => instance.testMethod('hello'));
    });
  });

  describe('Not Assertions', () => {
    class TestClass extends withTypeCheckers() {
      testMethod(value) {
        this.assert.is.not.number(value, 'value');
      }
    }
    const instance = new TestClass();

    it('throws when value matches negated type', () => {
      assertThrows(
        () => instance.testMethod(42),
        'value expected not number but got [number 42]'
      );
    });

    it('does not throw when value doesnt match negated type', () => {
      assertDoesNotThrow(() => instance.testMethod('hello'));
    });
  });

  describe('Custom Error Messages', () => {
    const TestClass = withTypeCheckers(class TestClass {
      id =1;
      testMethod(value) {
        this.assert.is.number(value, 'input value');
      }
    }, {
      classPrefix: 'CustomClass',
      instancePrefix() {
        return '#'+this.id;
      }
    })
    const instance = new TestClass();

    it('uses custom prefixes in error messages', () => {
      assertThrows(
        () => instance.testMethod('not a number'),
        'CustomClass #1 input value expected number but got [string "not a number"]'
      );
    });
  });

  describe('Custom Type Checkers', () => {
    const withCustom = createWithTypeCheckers({
      even: v => typeof v === 'number' && v % 2 === 0,
      odd: v => typeof v === 'number' && v % 2 !== 0
    });

    class TestClass extends withCustom() {
      testEven(value) {
        this.assert.is.even(value, 'value');
      }
    }
    const instance = new TestClass();

    it('uses custom type checkers', () => {
      assertThrows(
        () => instance.testEven(3),
        'value expected even but got [number 3]'
      );
      assertDoesNotThrow(() => instance.testEven(4));
    });
  });

  describe('Static Methods', () => {
    class TestClass extends withTypeCheckers() {}
    
    it('static is method works', () => {
      assert(TestClass.is('string', 'hello'));
      assert(!TestClass.is('string', 42));
    });

    it('static assert method works', () => {
      assertDoesNotThrow(() => TestClass.assert.is.string('hello', 'test'));
      assertThrows(
        () => TestClass.assert.is.string(42, 'test'),
        'test expected string but got [number 42]'
      );
    });
    it('static assert with no desc works', () => {
      assertDoesNotThrow(() => TestClass.assert.is.string('hello'));
      assertThrows(
        () => TestClass.assert.is('string', 42),
        'expected string but got [number 42]'
      );
    });
  });

  describe('Edge Cases', () => {
    const TestClass = withTypeCheckers();
    const instance = new TestClass();

    it('handles NaN correctly', () => {
      assert(!instance.is('number', NaN));
    });

    it('handles infinite numbers correctly', () => {
      assert(instance.is('number', Infinity));
    });

    it('distinguishes between array and object', () => {
      assert(instance.is('array', []));
      assert(!instance.is('object', []));
    });
  });

  describe('Array & Object Specs', () => {
  const TestClass = withTypeCheckers();
  const instance = new TestClass();

  /* ---------- arrays ---------- */
  it('homogeneous array of strings', () => {
    assert(instance.is(['string'], ['a', 'b']));
    assert(!instance.is(['string'], ['a', 1]));
  });

   it('nested array', () => {
    assert(instance.is([['string']], [['a', 'b'], ['c']]));
    assert(!instance.is([['string']], [['a', 1]]));
  });

  /* ---------- objects ---------- */
  it('shape {name:string,age:number}', () => {
    assert(instance.is({ name: 'string', age: 'number' }, { name: 'Bob', age: 30 }));
    assert(!instance.is({ name: 'string', age: 'number' }, { name: 'Bob' }));          // missing
    assert(!instance.is({ name: 'string', age: 'number' }, { name: 30, age: 30 }));    // wrong type
  });

  it('nested shape', () => {
    const spec = { user: { id: 'number', name: 'string' } };
    assert(instance.is(spec, { user: { id: 1, name: 'Ann' } }));
    assert(!instance.is(spec, { user: { id: '1', name: 'Ann' } }));
  });

  it('optional field via union', () => {
    assert(instance.is({ name: 'string', age: 'number|undefined' }, { name: 'Bob' }));
    assert(instance.is({ name: 'string', age: 'number|undefined' }, { name: 'Bob', age: 30 }));
    assert(!instance.is({ name: 'string', age: 'number|undefined' }, { name: 'Bob', age: 'x' }));
  });

  it('mixed array + object', () => {
    const spec = { tags: ['string'], meta: { count: 'number' } };
    assert(instance.is(spec, { tags: ['a', 'b'], meta: { count: 2 } }));
    assert(!instance.is(spec, { tags: [1], meta: { count: 2 } }));
  });
});

});

// Run tests
report();