'use strict';

var cc = require('./core');


var lift = function(fn, context) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    return cc.go(wrapGenerator.mark(function() {
      var i;

      return wrapGenerator(function($ctx0) {
        while (1) switch ($ctx0.next) {
        case 0:
          i = 0;
        case 1:
          if (!(i < args.length)) {
            $ctx0.next = 8;
            break;
          }

          $ctx0.next = 4;
          return args[i];
        case 4:
          args[i] = $ctx0.sent;
        case 5:
          ++i;
          $ctx0.next = 1;
          break;
        case 8:
          $ctx0.rval = fn.apply(context, args);
          delete $ctx0.thrown;
          $ctx0.next = 12;
          break;
        case 12:
        case "end":
          return $ctx0.stop();
        }
      }, this);
    }));
  };
};


var chain = function(initial) {
  var args = Array.prototype.slice.call(arguments, 1);

  return cc.go(wrapGenerator.mark(function() {
    var val, form, i;

    return wrapGenerator(function($ctx1) {
      while (1) switch ($ctx1.next) {
      case 0:
        val = initial;
        i = 0;
      case 2:
        if (!(i < args.length)) {
          $ctx1.next = 11;
          break;
        }

        form = args[i];
        $ctx1.next = 6;
        return val;
      case 6:
        val = $ctx1.sent;

        if (typeof form == 'function')
          val = form(val);
        else if (Array.isArray(form) && typeof form[0] == 'function')
          val = form[0].apply(null, [].concat(form[1], [val], form.slice(2)));
        else if (Array.isArray(form) && typeof form[0] == 'string')
          val = val[form[0]].apply(val, form.slice(1));
        else
          val = form;
      case 8:
        ++i;
        $ctx1.next = 2;
        break;
      case 11:
        $ctx1.next = 13;
        return val;
      case 13:
        $ctx1.rval = $ctx1.sent;
        delete $ctx1.thrown;
        $ctx1.next = 17;
        break;
      case 17:
      case "end":
        return $ctx1.stop();
      }
    }, this);
  }));
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
