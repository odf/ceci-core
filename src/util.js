'use strict';

var cc = require('./core');


var sleep = function(ms) {
  var result = cc.defer();
  var t = setTimeout(function() {
    clearTimeout(t);
    result.resolve();
  }, ms);
  return result;
};


var ncallback = function(deferred) {
  return function(err, val) {
    if (err)
      deferred.reject(new Error(err));
    else
      deferred.resolve(val);
  };
};


var nbind = function(fn, context) {
  var boundArgs = Array.prototype.slice.call(arguments, 2);

  return function() {
    var args = Array.prototype.slice.call(arguments);
    var result = cc.defer();

    fn.apply(context, boundArgs.concat(args, ncallback(result)));

    return result;
  };
};


var nodeify = function(deferred, callback) {
  if (callback === undefined)
    return deferred;
  else {
    deferred.then(function(val) {
      callback(null, val)
    }, function(err) {
      callback(err);
    });
  }
};


module.exports = {
  sleep    : sleep,
  ncallback: ncallback,
  nbind    : nbind,
  nodeify  : nodeify
};
