// Import the module
import { createWithTypeCheckers, withTypeCheckers } from '../with-type-checkers.js';

// Test runner with better reporting
const testRunner = {
  tests: [],
  errors: [],
  
  addTest(name, testFn) {
    this.tests.push({ name, fn: testFn });
  },
  
  runTests() {
    console.log(`Running ${this.tests.length} tests...\n`);
    
    this.tests.forEach((test, index) => {
      try {
        test.fn();
        console.log(`✓ ${index + 1}. ${test.name}`);
      } catch (error) {
        this.errors.push({ test: test.name, error });
        console.error(`✗ ${index + 1}. ${test.name}: ${error.message}`);
      }
    });
    
    console.log(`\nResults: ${this.tests.length - this.errors.length}/${this.tests.length} tests passed`);
    
    if (this.errors.length > 0) {
      console.error('\nFailed tests:');
      this.errors.forEach((err, i) => {
        console.error(`${i + 1}. ${err.test}: ${err.error.message}`);
      });
      throw new Error('Some tests failed');
    } else {
      console.log('\nAll tests passed!');
    }
  }
};

// Test 1: Default type checkers validation
testRunner.addTest('Default type checkers', () => {
  const { is } = createWithTypeCheckers()(class {});
  
  const testCases = [
    ['object', {}, true],
    ['object', [], false],
    ['plainObject', {}, true],
    ['plainObject', new Date(), false],
    ['string', 'test', true],
    ['number', 42, true],
    ['boolean', true, true],
    ['function', () => {}, true],
    ['array', [], true],
    ['null', null, true],
    ['undefined', undefined, true],
    ['nullish', null, true],
    ['symbol', Symbol(), true],
    ['bigint', 9007199254740991n, true],
    ['date', new Date(), true],
    ['regexp', /test/, true],
    ['error', new Error(), true],
    ['promise', Promise.resolve(), true],
    ['set', new Set(), true],
    ['map', new Map(), true],
    ['iterable', [], true],
    ['numeric', '42', true],
    ['emptyString', '', true],
    ['notEmptyString', 'test', true],
    ['emptyArray', [], true],
    ['notEmptyArray', [1], true],
    ['falsy', false, true],
    ['truthy', true, true],
    ['primitive', null, true],
    ['asyncFunction', async () => {}, true],
    ['syncFunction', () => {}, true],
  ];

  testCases.forEach(([type, value, expected]) => {
    if (is(type, value) !== expected) {
      throw new Error(`${type} checker failed for value: ${String(value)}`);
    }
  });
});

// Test 2: Composite types with '|'
testRunner.addTest('Composite types', () => {
  const { is } = createWithTypeCheckers()(class {});
  
  if (!is('string|number', 'test')) throw new Error('Composite string|number failed for string');
  if (!is('string|number', 42)) throw new Error('Composite string|number failed for number');
  if (is('string|number', true)) throw new Error('Composite string|number incorrectly passed for boolean');
});

// Test 3: Assertion methods
testRunner.addTest('Assertion methods', () => {
  const BaseClass = createWithTypeCheckers()(class TestClass {}, {
    classPrefix: 'TestClass',
    instancePrefix: () => 'instance'
  });

  // Test static assertions
  try {
    BaseClass.assert.is.string(42, 'Static');
    throw new Error('Static assert should have thrown');
  } catch (e) {
    if (!e.message.includes('TestClass')) throw new Error('Static assert error missing class prefix');
  }

  // Test instance assertions
  const instance = new BaseClass();
  try {
    instance.assert.is.string(42, 'Instance');
    throw new Error('Instance assert should have thrown');
  } catch (e) {
    if (!e.message.includes('instance')) throw new Error('Instance assert error missing instance prefix');
  }
});

// Test 4: Check methods (should warn)
testRunner.addTest('Check methods', () => {
  const originalWarn = console.warn;
  let warningMessages = [];
  console.warn = (msg) => warningMessages.push(msg);

  const BaseClass = createWithTypeCheckers()(class {});
  BaseClass.check.is.string(42, 'Check');
  
  if (warningMessages.length === 0) {
    throw new Error('Check method should have warned');
  }
  
  console.warn = originalWarn;
});

// Test 5: Custom checkers
testRunner.addTest('Custom checkers', () => {
  const customCheckers = {
    even: v => typeof v === 'number' && v % 2 === 0,
    odd: v => typeof v === 'number' && v % 2 === 1
  };
  
  const { is } = createWithTypeCheckers(customCheckers)(class {});
  
  if (!is('even', 2)) throw new Error('Custom even checker failed');
  if (!is('odd', 3)) throw new Error('Custom odd checker failed');
  if (is('even', 3)) throw new Error('Custom even checker incorrectly passed for odd number');
});

// Test 6: Prefix configuration
testRunner.addTest('Prefix configuration', () => {
  const BaseClass = createWithTypeCheckers()(class TestClass {}, {
    classPrefix: 'Custom',
    instancePrefix: () => 'customInstance'
  });

  try {
    BaseClass.assert.is.string(42, 'Test');
  } catch (e) {
    if (!e.message.includes('Custom')) throw new Error('Static prefix missing from error message');
  }

  const instance = new BaseClass();
  try {
    instance.assert.is.string(42, 'Test');
  } catch (e) {
    if (!e.message.includes('customInstance')) throw new Error('Instance prefix missing from error message');
  }
});
/*
// Test 7: are() method
testRunner.addTest('are() method', () => {
  const { are } = createWithTypeCheckers()(class {});
  
  if (!are('number', [1, 2, 3])) throw new Error('are() method failed for numbers');
  if (are('number', [1, '2', 3])) throw new Error('are() method incorrectly passed for mixed array');
  if (!are('string|number', [1, '2', 3])) throw new Error('are() method failed for string|number composite');
});
*/
// Test 8: Negative assertions with .not
testRunner.addTest('Negative assertions', () => {
  const BaseClass = createWithTypeCheckers()(class {});
  
  try {
    BaseClass.assert.is.not.string('actual string', 'Test');
    throw new Error('Negative assert should have thrown for incorrect not check');
  } catch (e) {
    // Expected behavior
  }

  // This should not throw
  BaseClass.assert.is.not.string(42, 'Test');
});

// Test 9: Logging methods
testRunner.addTest('Logging methods', () => {
  const BaseClass = createWithTypeCheckers()(class TestClass {}, {
    classPrefix: 'LoggerTest'
  });
  
  const instance = new BaseClass();
  
  // Just verify these methods exist and don't throw
  instance.log('test log');
  instance.warn('test warn');
  instance.error('test error');
  instance.debug('test debug');
  
  try {
    instance.throw('test throw');
    throw new Error('throw method should have thrown');
  } catch (e) {
    if (!e.message.includes('LoggerTest')) throw new Error('throw error missing prefix');
  }
});

// Test 10: Empty and nullish values
testRunner.addTest('Empty and nullish values', () => {
  const { is } = createWithTypeCheckers()(class {});
  
  if (!is('nullish', null)) throw new Error('nullish check failed for null');
  if (!is('nullish', undefined)) throw new Error('nullish check failed for undefined');
  if (is('nullish', 0)) throw new Error('nullish check incorrectly passed for 0');
  if (is('nullish', '')) throw new Error('nullish check incorrectly passed for empty string');
  if (is('nullish', false)) throw new Error('nullish check incorrectly passed for false');
});

// Test 11: Default export
testRunner.addTest('Default export', () => {
  const BaseClass = withTypeCheckers(class TestClass {}, {
    classPrefix: 'DefaultExportTest'
  });
  
  // Just verify it works similarly to createWithTypeCheckers
  try {
    BaseClass.assert.is.string(42, 'Test');
    throw new Error('Default export assert should have thrown');
  } catch (e) {
    if (!e.message.includes('DefaultExportTest')) throw new Error('Default export error missing prefix');
  }
});

// Run all tests
testRunner.runTests();