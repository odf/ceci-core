ceci-core
=========

Ceci is a Javascript library inspired by Go's channels and goroutines and by Clojure's core.async. It depends on ES6 generators and requires a preprocessor to run under Javascript engines that do not yet support those. An easy way to use Ceci directly right now is under NodeJS 0.11.x with the --harmony option.

The full library will have several levels of functionality, of which ceci-core is the lowest. Like a number of similar libraries, ceci-core lets one write asynchronous code that is structured just like synchronous code. This is achieved by a combination of two abstractions: go blocks and deferred values.

The implementation tries to avoid unnecessary overhead as much as possible, so that many go blocks can run concurrently and communicate via the mechanisms provided in Ceci's higher layers.

Let's look at a simple example:
    
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

The output looks like this:

    I am main
    I am also main
    I am go block 1
    I am go block 2
    I am go block 1
    I am go block 2

Two go blocks are created by calling the `go()` function with a generator argument created with the `function*` keyword. Those two blocks run after the main program is finished. Whenever an expression preceded by `yield` is encountered, the current go block pauses after evaluating the expression, so that the other one can run.
