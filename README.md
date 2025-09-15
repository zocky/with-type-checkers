# with-type-checkers

A powerful JavaScript utility for adding runtime type checking and assertions to classes with zero configuration and extensive built-in type checkers.

## Features

- **30+ built-in type checkers** - From basic types to complex objects
- **Class and instance methods** - Type checking available on both static and instance contexts
- **Flexible assertion modes** - `assert` (throws errors) and `check` (console warnings)
- **Extensible** - Add your own custom type checkers
- **Zero dependencies** - Lightweight and self-contained
- **ES6 class mixin** - Works with any existing class or creates standalone checker classes
- **TypeScript-friendly** - Full type inference support

## Installation

```bash
npm install with-type-checkers
```

## Quick Start

```javascript
import { withTypeCheckers } from 'with-type-checkers';

class MyClass extends withTypeCheckers() {
  processData(input) {
    // Throws error if input is not a string
    this.assert.is.string(input, 'Input');
    
    // Warns if input is empty
    this.check.is.notEmptyString(input, 'Input');
    
    return input.toUpperCase();
  }
}

const instance = new MyClass();
instance.processData("hello"); // ✅ Works
instance.processData(123);     // ❌ Throws: "Input expected string but got 123"
```

## Built-in Type Checkers

### Basic Types
- `string`, `number`, `boolean`, `function`, `object`, `array`
- `null`, `undefined`, `nullish` (null or undefined)
- `symbol`, `bigint`

### Advanced Types
- `plainObject` - Plain objects (not arrays, dates, etc.)
- `date` - Valid Date objects
- `regexp` - Regular expressions
- `error` - Error instances
- `promise` - Promise-like objects
- `set`, `map`, `weakset`, `weakmap`
- `iterable` - Objects with Symbol.iterator

### String & Array Validators
- `emptyString`, `notEmptyString`
- `emptyArray`, `notEmptyArray`
- `numeric` - Parseable numbers (including strings)

### Function Types
- `asyncFunction` - Async functions
- `syncFunction` - Synchronous functions

### Utility Types
- `primitive` - Non-object, non-function values
- `truthy`, `falsy`

## API Reference

### Basic Usage

```javascript
// Extend existing class
class MyClass extends withTypeCheckers(BaseClass) {
  // Your methods here
}

// Create standalone checker class
class TypeChecker extends withTypeCheckers() {
  // Your methods here
}
```

### Instance Methods

```javascript
const instance = new MyClass();

// Type checking
instance.is('string', 'hello')        // true
instance.is('string|number', 123)     // true (union types)
instance.is.not('array', 'hello')     // true

// Array type checking
instance.are('string', ['a', 'b'])    // true
instance.are('string|number', [1, 'a']) // true

// Assertions (throw errors)
instance.assert.is.string(value, 'Parameter name');
instance.assert.is.not.null(value, 'Value');
instance.assert.are.number([1, 2, 3], 'Numbers array');

// Checks (console warnings)
instance.check.is.notEmptyArray(arr, 'Data array');
instance.check.is.not.undefined(config, 'Configuration');

// Logging with prefixes
instance.log('Processing started');
instance.warn('Deprecated method used');
instance.error('Processing failed');
instance.debug('Debug info');
instance.throw('Fatal error occurred');
```

### Static Methods

```javascript
// Available on the class itself
MyClass.assert.is.function(callback, 'Callback');
MyClass.is('object', {});
MyClass.log('Class initialized');
```

### Configuration Options

```javascript
const CheckerClass = withTypeCheckers(BaseClass, {
  // Static method prefix (default: class name)
  classPrefix: 'MyValidator',
  
  // Instance method prefix function
  instancePrefix: function(instance) {
    return `${this.constructor.name}#${instance.id}`;
  }
});
```

## Advanced Examples

### Custom Type Checkers

```javascript
import { createWithTypeCheckers } from 'with-type-checkers';

const customCheckers = {
  email: v => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  positiveNumber: v => typeof v === 'number' && v > 0,
  nonEmptyObject: v => typeof v === 'object' && v !== null && Object.keys(v).length > 0
};

const withCustomCheckers = createWithTypeCheckers(customCheckers);

class UserValidator extends withCustomCheckers() {
  validateUser(user) {
    this.assert.is.nonEmptyObject(user, 'User object');
    this.assert.is.email(user.email, 'Email');
    this.assert.is.positiveNumber(user.age, 'Age');
  }
}
```

### Data Processing Pipeline

```javascript
class DataProcessor extends withTypeCheckers() {
  process(data) {
    // Validate input
    this.assert.is.array(data, 'Input data');
    this.assert.are('object', data, 'Data items');
    
    // Process with warnings for data quality
    return data.map((item, index) => {
      this.check.is.notEmptyString(item.name, `Item ${index} name`);
      this.check.is.number(item.value, `Item ${index} value`);
      
      return {
        ...item,
        processed: true,
        timestamp: new Date()
      };
    });
  }
}
```

### API Validation

```javascript
class APIHandler extends withTypeCheckers() {
  handleRequest(req, res) {
    // Validate request structure
    this.assert.is.object(req.body, 'Request body');
    this.assert.is.string(req.body.action, 'Action');
    
    // Optional parameters with warnings
    this.check.is.object(req.body.params, 'Parameters');
    this.check.is.string(req.body.clientId, 'Client ID');
    
    // Union type validation
    this.assert.is('string|number', req.body.id, 'Resource ID');
    
    // Process request...
  }
}
```

## Error Messages

The library provides clear, descriptive error messages:

```javascript
// Throws: "UserData expected string but got 123"
this.assert.is.string(123, 'UserData');

// Warns: "Config expected notEmptyArray but got []"
this.check.is.notEmptyArray([], 'Config');
```

## Union Types

Support for multiple acceptable types using the pipe operator:

```javascript
// Accepts strings or numbers
this.assert.is('string|number', value, 'ID');

// Arrays of mixed types
this.assert.are('string|number|boolean', mixedArray, 'Mixed data');
```

## TypeScript Support

While this is a JavaScript library, it works well with TypeScript:

```typescript
interface User {
  name: string;
  age: number;
}

class UserService extends withTypeCheckers() {
  processUser(user: User) {
    this.assert.is.object(user, 'User');
    this.assert.is.string(user.name, 'User name');
    this.assert.is.number(user.age, 'User age');
    // TypeScript knows user is properly typed here
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Changelog

### 1.0.0
- Initial release
- 30+ built-in type checkers
- Class and instance method support
- Custom type checker support
- Union type support
- Comprehensive error messaging