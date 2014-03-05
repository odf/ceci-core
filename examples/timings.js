'use strict';

var cc = require('../lib/index');
var Q = require('kew');


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


var check = function(n, r) {
  var s = 0;
  for (var i = 1; i < n; ++i)
    s += i;
  if (s != r)
    console.log('Oops: expected ' + s + ', got ' + r);
};


cc.chain(
  null,

  runner(function*(done) {
    var i, j = 0;
    for (i = 0; !done(); ++i)
      j += (i % 50000 == 0) ? yield i : i;
    console.log('  loop executions per second: ' + i);
    check(i, j);
  }),

  runner(function*(done) {
    var i, j = 0;
    for (i = 0; !done(); ++i)
      j += yield i;
    console.log('           yields per second: ' + i);
    check(i, j);
  }),

  runner(function*(done) {
    var i, j = 0, d;
    for (i = 0; !done(); ++i) {
      d = cc.defer();
      d.resolve(i);
      j += yield d;
    }
    console.log('deferreds yielded per second: ' + i);
    check(i, j);
  }),

  runner(function*(done) {
    var i, j = 0, p;
    for (i = 0; !done(); ++i) {
      p = Q.resolve(i);
      j += yield p;
    }
    console.log(' promises yielded per second: ' + i);
    check(i, j);
  }),

  runner(function*(done) {
    var i, j = 0;
    var block = function*() { return i; };
    for (i = 0; !done(); ++i)
      j += yield cc.go(block);
    console.log('      go routines per second: ' + i);
    check(i, j);
  })
).then(null, function(ex) { throw ex; });
