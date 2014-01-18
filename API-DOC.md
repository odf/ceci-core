The ceci-core API
=================

####go `ceci.go(gen, args...)`

Executes a go block. The first argument must be an ES6 generator function (created via `function*`), to which the remaining arguments are passed upon execution. Go blocks run uninterrupted until a `yield` is encountered, at which control is passed to next (possibly the same) go block which is able to continue.

```javascript
var gen = function*(name) { console.log('Goodbye'); yield null; console.log(name + '!'); };
ceci.go(gen, 'callbacks');
ceci.go(function*() { console.log('cruel'); });
// prints "Goodbye", then "cruel", then "callbacks!"
```


####defer `ceci.defer()`

Creates a deferred value. A deferred value can be resolved with a value via the `resolve` method and rejected with an error object via the `reject` method. Prefixing a deferred value with the `yield` keyword blocks the current go block until the value is resolved.

```javascript
var result = ceci.defer();
ceci.go(function*() { console.log('Waiting...'); console.log(yield result); });
ceci.go(function*() { result.resolve(1); console.log('Resolved!'); });
// prints "Waiting...", then "Resolved!", then 1
```

