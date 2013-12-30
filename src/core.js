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
  var succeed = function(val) { enqueue(function() { use(gen.next(val)); }); };
  var fail    = function(val) { enqueue(function() { use(gen.throw(val)); }); };

  var use = function(step) {
    var val = step.value;

    if (step.done)
      result.resolve(val);
    else if (val != null && typeof val.then == 'function')
      val.then(succeed, fail);
    else
      succeed(val);
  };

  succeed();
  return result;
};


module.exports = {
  RingBuffer: RingBuffer,
  defer     : defer,
  go        : go
};
