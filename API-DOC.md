The ceci-core API
=================

####go `ceci.go(gen, args...)`

Executes a go block. The first argument must be an ES6 generator (created via `function*`), which is called with the remaining arguments. Go blocks run uninterrupted until a `yield` is encountered, at which point control is passed to the next (possibly the same) go block that is able to continue.

Returns a deferred value (see below) which is eventually resolved with the return value of the specified generator.

```javascript
var gen = function*(name) { console.log('Goodbye'); yield null; console.log(name + '!'); };
ceci.go(gen, 'callbacks');
ceci.go(function*() { console.log('cruel'); });
// prints "Goodbye", then "cruel", then "callbacks!"
```


####defer `ceci.defer()`

Creates a deferred value. A deferred value can be resolved with a value via the `resolve` method or rejected with an error object via the `reject` method. Prefixing a deferred value with the `yield` keyword blocks the current go block until the value is resolved.

A deferred value can be resolved or rejected no more than once, and can be used with a `yield` no more than once. The method `isResolved` can be used to test without blocking whether a deferred value has been resolved or not, but there is no supported way to retrieve its value without a `yield`.

```javascript
var result = ceci.defer();
ceci.go(function*() { console.log('Waiting...'); console.log(yield result); });
ceci.go(function*() { result.resolve(1); console.log('Resolved!'); });
// prints "Waiting...", then "Resolved!", then 1
```


####sleep `ceci.sleep(ms)`

Returns a deferred value that is resolved after the specified number of miliseconds.

```javascript
ceci.go(function*() { console.log('Hello'); yield ceci.sleep(1000); console.log('Ceci!'); });
// prints "Hello", pauses for a second, then prints "Ceci!"
```


####chain `ceci.chain(start, forms...)`

Executes a chain of function calls and returns a deferred value which is eventually resolved with the final result. The first argument specifies the start value, each subsequent argument is either a function or an array consisting of a function and one or more arguments. Each function is called with the previous value, which is first resolved via `yield`, as its single argument in the case where no function arguments are given, or as its second argument otherwise.

```javascript
var lift = function(fn) { return function(val) { return ceci.go(function*() { return fn(val); }); } };
ceci.chain(
  ceci.go(function*() { yield ceci.sleep(1000); return 5; }),
  lift(function(val) { return val + 2; }),
  lift(function(val) { return val * 2; }),
  console.log);
// pauses for a second, then prints 14
```
