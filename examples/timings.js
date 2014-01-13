'use strict';

var cc = require('../index');


cc.chain(null,
  function() {
    var done = false;

    cc.go(function*() {
      yield cc.sleep(1000);
      done = true;
    });

    return cc.go(function*() {
      var i, j;

      for (i = 0; ; ++i) {
        if (done) {
          console.log('loop executions per second: ' + i);
          break;
        }
        else if (i % 50000 == 0)
          j = yield i;
        else
          j = i;
      }
    })
  },
  function() {
    var done = false;

    cc.go(function*() {
      yield cc.sleep(1000);
      done = true;
    });

    return cc.go(function*() {
      var i, j;

      for (i = 0; ; ++i) {
        if (done) {
          console.log('         yields per second: ' + i);
          break;
        }
        else
          j = yield i;
      }
    })
  },
  function() {
    var done = false;

    cc.go(function*() {
      yield cc.sleep(1000);
      done = true;
    });

    return cc.go(function*() {
      var i, j;

      for (i = 0; ; ++i) {
        if (done) {
          console.log('    go routines per second: ' + i);
          break;
        }
        else
          j = yield cc.go(function*() { return i; });
      }
    })
  }
);
