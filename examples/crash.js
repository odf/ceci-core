'use strict';

var cc = require('../lib/index');

cc.longStackSupport = true;

var a = function() {
  return cc.go(function*() {
    throw new Error("Oops!");
  });
};

var b = function() {
  return cc.go(function*() {
    return yield cc.go(function*() {
      return yield a();
    });
  });
};

var c = function() {
  return cc.go(function*() {
    return yield b();
  });
};

c().then(null, function(ex) { console.log(ex.stack); });
