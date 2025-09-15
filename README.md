# with-type-checkers

A JavaScript/TypeScript utility for adding runtime type checking and assertions to classes.

## Installation

```bash
npm install with-type-checkers
```

## Usage

### Basic Class Mixin

```javascript
import withTypeCheckers from 'with-type-checkers';

class MyClass extends withTypeCheckers() {
  setName(name) {
    this.assert.is.string(name, 'name');
    this.name = name;
  }
  
  setAge(age) {
    this.assert.is.number(age, 'age');
    this.age = age;
  }
}

const instance = new MyClass();
instance.setName("John"); // OK
instance.setName(123); // Throws: "MyClass name expected string but got 123"
```

### Extending Existing Classes

```javascript
class BaseUser {
  constructor(id) {
    this.id = id;
  }
}

class User extends withTypeCheckers(BaseUser) {
  setEmail(email) {
    this.assert.is.string(email, 'email');
    this.check.is.notEmptyString(email, 'email'); // Warning instead of error
    this.email = email;
  }
}
```

### Configuration Options

```javascript
class MyClass extends withTypeCheckers({
  classPrefix: 'CustomClass',
  instancePrefix: function() { return `#${this.id}`; }
}) {
  constructor(id) {
    super();
    this.id = id;
  }
  
  validate(data) {
    this.assert.is.object(data, 'data'); 
    // Error: "CustomClass #123 data expected object but got null"
  }
}
```

## API

### Type Checkers

Available on both `assert.is` and `check.is`:

| Checker | Description |
|---------|-------------|
| `object` | Non-null object (excludes arrays) |
| `plainObject` | Plain object literal |
| `string` | String primitive |
| `number` | Number primitive |
| `boolean` | Boolean primitive |
| `function` | Function |
| `array` | Array |
| `null` | Null value |
| `undefined` | Undefined value |
| `nullish` | Null or undefined |
| `symbol` | Symbol primitive |
| `bigint` | BigInt primitive |
| `date` | Valid Date object |
| `regexp` | RegExp object |
| `error` | Error instance |
| `promise` | Promise or thenable |
| `set` | Set instance |
| `map` | Map instance |
| `weakset` | WeakSet instance |
| `weakmap` | WeakMap instance |
| `iterable` | Object with Symbol.iterator |
| `numeric` | Parseable number (string or number) |
| `emptyString` | Empty string |
| `notEmptyString` | Non-empty string |
| `emptyArray` | Empty array |
| `notEmptyArray` | Non-empty array |
| `falsy` | Falsy value |
| `truthy` | Truthy value |
| `primitive` | Primitive value (not object/function) |
| `asyncFunction` | Async function |
| `syncFunction` | Synchronous function |

### Methods

#### `assert.is.{type}(value, description)`
Throws an error if the type check fails.

#### `assert.is.not.{type}(value, description)`
Throws an error if the type check passes.

#### `check.is.{type}(value, description)`
Logs a warning if the type check fails.

#### `check.is.not.{type}(value, description)`
Logs a warning if the type check passes.

#### `is(type, value)`
Returns boolean. Supports union types with `|`:
```javascript
this.is('string|number', value); // true if string OR number
```

#### Utility Methods
- `log(message)` - Console log with prefix
- `warn(message)` - Console warning with prefix
- `error(message)` - Console error with prefix
- `debug(message)` - Console debug with prefix
- `throw(message)` - Throw error with prefix

## Custom Type Checkers

```javascript
import { createWithTypeCheckers } from 'with-type-checkers';

const withCustomCheckers = createWithTypeCheckers({
  email: v => typeof v === 'string' && /\S+@\S+\.\S+/.test(v),
  positiveInteger: v => Number.isInteger(v) && v > 0
});

class User extends withCustomCheckers() {
  setEmail(email) {
    this.assert.is.email(email, 'email');
  }
  
  setAge(age) {
    this.assert.is.positiveInteger(age, 'age');
  }
}
```

## Error Messages

Error messages follow the format: `{prefix} {description} expected {type} but got {value}`

Example: `"MyClass #123 email expected string but got 456"`

## License

MIT