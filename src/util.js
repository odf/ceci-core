'use strict';

var cc = require('./core');


var lift = function(fn, context) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    return cc.go(function*() {
      var i;
      for (i = 0; i < args.length; ++i)
        args[i] = yield args[i];
      return fn.apply(context, args);
    });
  };
};


var chain = function(initial) {
  var args = Array.prototype.slice.call(arguments, 1);

  return cc.go(function*() {
    var val = initial;
    var form;

    for (var i = 0; i < args.length; ++i) {
      form = args[i];
      val = yield val;

      if (typeof form == 'function')
        val = form(val);
      else if (Array.isArray(form) && typeof form[0] == 'function')
        val = form[0].apply(null, [].concat(form[1], [val], form.slice(2)));
      else if (Array.isArray(form) && typeof form[0] == 'string')
        val = val[form[0]].apply(val, form.slice(1));
      else
        val = form;
    }

    return yield val;
  });
};


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
  lift     : lift,
  chain    : chain,
  sleep    : sleep,
  ncallback: ncallback,
  nbind    : nbind,
  nodeify  : nodeify
};
