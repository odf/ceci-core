'use strict';

require('setimmediate');

var RingBuffer = require('./RingBuffer');
var Deferred   = require('./Deferred');


var scheduler = function(size) {
  var queue = new RingBuffer(size || 100);
  var scheduleFlush = true;

  var flush = function() {
    scheduleFlush = true;
    for (var i = queue.count(); i > 0; --i)
      queue.read()();
  };

  return function(thunk) {
    if (queue.isFull())
      queue.resize(Math.floor(queue.capacity() * 1.5));
    queue.write(thunk);
    if (scheduleFlush) {
      setImmediate(flush);
      scheduleFlush = false;
    }
  };
};

var enqueue = scheduler();


var defer = function() {
  return new Deferred();
};


var go = function(generator) {
  var args    = Array.prototype.slice.call(arguments, 1);
  var gen     = generator.apply(undefined, args);
  var result  = defer();
  var succeed = function(val) { enqueue(function() { use(val, true); }); };
  var fail    = function(val) { enqueue(function() { use(val, false); }); };

  var use = function(last, success) {
    try {
      var step = success ? gen.next(last) : gen['throw'](last);
      var val = step.value;

      if (step.done)
        result.resolve(val);
      else if (val != null && typeof val.then == 'function')
        val.then(succeed, fail);
      else
        succeed(val);
    } catch (ex) {
      result.reject(ex);
      return;
    }
  };

  succeed();
  return result;
};


module.exports = {
  defer: defer,
  go   : go
};
