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
    return cc.go(function*() {
      return a();
    });
  });
};

var c = function() {
  return cc.go(function*() {
    return b();
  });
};

c().then(null, function(ex) { console.log(ex.stack); });
