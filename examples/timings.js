'use strict';

var cc = require('../lib/index');

var runner = function(code) {
  return function() {
    var done = false;

    cc.go(function*() {
      yield cc.sleep(1000);
      done = true;
    });

    return cc.go(code, function() { return done; });
  };
};


cc.chain(
  null,

  runner(function*(done) {
    var i, j;
    for (i = 0; !done(); ++i)
      j = (i % 50000 == 0) ? yield i : i;
    console.log('loop executions per second: ' + i);
  }),

  runner(function*(done) {
    var i, j;
    for (i = 0; !done(); ++i)
      j = yield i;
    console.log('         yields per second: ' + i);
  }),

  runner(function*(done) {
    var i, j;
    var block = function*() { return i; };
    for (i = 0; !done(); ++i)
      j = yield cc.go(block);
    console.log('    go routines per second: ' + i);
  })
);
