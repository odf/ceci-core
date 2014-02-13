ceci-core
=========

About
-----

Ceci's take on concurrency is inspired by [Go](http://golang.org/)'s channels and goroutines, and by the [core.async](https://github.com/clojure/core.async/) library for [Clojure](http://clojure.org/). Both are strongly influenced by Tony Hoare's theory of communicating sequential processes (CSP), and somewhat related to the classical Unix concept of pipes. The common feature of all these approaches is the idea of providing a single communication mechanism, usually called a channel, between concurrent threads of execution (processes, threads, goroutines etc) with semantics that make it both practical and comparatively easy to reason about.

While the implementation of channels is left to the [ceci-channels](https://github.com/odf/ceci-channels) library, the aim of ceci-core is to build a solid foundation for this task while providing features that are also useful on their own. It is in some ways similar to libraries such as [co](https://github.com/visionmedia/co) which integrate asynchronous, non-blocking calls into a more traditional control flow through the use of ES6 generators, but puts a higher emphasis on composability and seamless concurrency.

Installation
------------

Install as a Node package:

```
npm install ceci-core
```

For easier integration, precompiled code (via [regenerator](https://npmjs.org/package/regenerator)) is included that runs on ES5 engines without generator support. To use this version, require it as follows:

```javascript
var cc = require('ceci-core');
```

Client code that uses go blocks still needs to run on an engine that supports generators or be precompiled into ES5-compliant code, for example with [browserify](https://github.com/substack/node-browserify) and the [regeneratorify](https://github.com/amiorin/regeneratorify) plugin.

When running on a JS engine that supports generators directly, such as NodeJS 0.11.x with the `--harmony` option, use the following line instead:

```javascript
var cc = require('ceci-core/es6');
```

Documentation
-------------

Find the full API documentation [here](https://github.com/odf/ceci-core/wiki/API-Documentation).

Tutorial
--------

###Go Blocks

Go blocks provide concurrent 'threads' of execution within a single Javascript thread. Let's look at a simple example:

```javascript    
var cc = require('ceci-core');

console.log("I am main");

cc.go(function*() {
  yield console.log("I am go block 1");
  yield console.log("I am go block 1");
});

cc.go(function*() {
  yield console.log("I am go block 2");
  yield console.log("I am go block 2");
});

console.log("I am also main");
```

The output looks like this:

    I am main
    I am also main
    I am go block 1
    I am go block 2
    I am go block 1
    I am go block 2

Two go blocks are created by calling the `go` function with a generator argument (using the `function*` keyword). The blocks run after the main program is finished. Whenever an expression preceded by `yield` is encountered, the current go block pauses after evaluating the expression, so that the other one can run.

###Deferreds

Things get more interesting when we add asynchronous calls to the mix. The following code wraps a Node-style callback into a deferred value:

```javascript
var fs = require('fs');
var cc = require('ceci-core');

var readFile = function(name) {
  var result = cc.defer();

  fs.readFile(name, function(err, val) {
    if (err)
      result.reject(new Error(err));
    else
      result.resolve(val);
  });

  return result;
};
```

This pattern will look quite familiar to those who have worked with promises, but Ceci's deferreds are much simpler. Here's how we can use them in go blocks:

```javascript
cc.go(function*() {
  console.log((yield readFile('package.json')).length);
  console.log((yield readFile('LICENSE')).length);
  console.log((yield readFile('README.md')).length);
});
```

The output looks something like this:

    885
    1090
    8753

A `yield` with an expression that evaluates to a deferred suspends the current go block. When the deferred is resolved, the block is scheduled to be resumed with the resulting value. From inside the block, this looks exactly like a blocking function call, except for the fact that we needed to add the `yield` keyword.

The code above reads the three files sequentially. We can instead read in parallel while still keeping the output in order by separating the function calls from the `yield` statements that force the results:

```javascript
cc.go(function*() {
  var a = readFile('package.json');
  var b = readFile('LICENSE');
  var c = readFile('README.md');
  
  console.log((yield a).length);
  console.log((yield b).length);
  console.log((yield c).length);
});
```

Finally, we can split the code into independent go routines that run concurrently:

```javascript
var showLength = function(filename) {
  cc.go(function*() {
    console.log(filename + ':', (yield readFile(filename)).length);
  });
};

showLength('package.json');
showLength('LICENSE');
showLength('README.md');
```

The order of the output lines now depends on which reads finished first and can be different between runs.

###Deferreds vs Promises

Another point worth noting is that Ceci's deferreds are not meant to be passed along and shared like promises. They are basically throw-away objects with the single purpose of decoupling the producer and consumer of a value. This is because Ceci's higher-level facilities for composing asynchronous computations are based on blocking channels as in Go rather than promises, and the extra functionality such as support for multiple callbacks or chaining is not needed at this level. That said, Ceci also lets us apply a `yield` directly to a promise, which can come in handy when working with libraries that already provide these. To demonstrate, here's a drop-in replacement for the `readFile` function above using the [q](https://github.com/kriskowal/q/tree/v0.9) library:

```javascript
var Q = require('q');
var fs = require('fs');

var readFile = Q.nbind(fs.readFile, fs);
```

###Composing Go Blocks

To be useful in practice, go blocks need to be able to return values, so that we can reuse smaller building blocks to form larger ones and finally whole programs. The return value of a `go` call is simply a deferred that will resolve to the return value of the generator that defines the go block. To see this in action, let's write a `fileLength` function based on `readFile`:

```javascript
var fileLength = function(name) {
  return cc.go(function*() {
    return (yield readFile(name)).length;
  });
};
```

This allows us to rewrite the original 'main' function like this:

```javascript
cc.go(function*() {
  console.log(yield fileLength('package.json'));
  console.log(yield fileLength('LICENSE'));
  console.log(yield fileLength('README.md'));
});
```

Note that in the current version of the library, the value returned from within the go block will always be wrapped in a deferred, which means that it needs to be an immediate value. If you have deferred, say `x`, that you'd like to pass out, you will need to write your return statement as `return yield x;`. 

###An Example Program

To finish off with a slightly more complex example, we will write a small NodeJS application that prints out a file with line numbers prepended to every fifth line. We start with a wrapper for the `readFile` function from Node's `fs` library:

```javascript
var fs = require('fs');
var cc = require('ceci-core');

var content = function(path) {
  var result = cc.defer();

  fs.readFile(path, { encoding: 'utf8' }, function(err, val) {
    if (err)
      result.reject(new Error(err));
    else
      result.resolve(val);
  });

  return result;
};
```

The only thing new here is the `reject` method on deferreds. Its effect is for the go block that the deferred is used in to throw an exception, which is often more useful than throwing directly from within a callback.

The next function reads a file via `content` and splits it into individual lines:

```javascript
var readLines = function(path) {
  return cc.go(function*() {
    return (yield content(path)).split('\n');
  });
};
```

We can now use this from another go block in the usual way:

```javascript
cc.go(function*() {
  var lines = yield readLines(process.argv[2]);

  for (var i = 1; i <= lines.length; ++i)
    console.log((i % 5 == 0 ? i : '') + '\t' + lines[i-1]);
});
```

###What's Next?

Go blocks and deferreds get us out of "callback hell" and avoid the typical fragmentation of program logic associated with asynchronous programming. They are a great solution when all we need is to chain together a number of asynchronous calls with some interspersed computation. But the real power of asynchronous computation comes from the ability to do things in parallel, which leads to the problem of maintaining state. In the "Are we there yet?" example, we used a global variable `done` to communicate information between two concurrent go blocks, which is clearly not ideal when things get more complex. Ceci's subsequent layer [ceci-channels](https://github.com/odf/ceci-channels) provides blocking channels, borrowed from the Go language, and from Clojure's core.async, as a message passing abstraction on top of go blocks and deferreds.

License
-------

Copyright (c) 2014 Olaf Delgado-Friedrichs.

Distributed under the MIT License.

