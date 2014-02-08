'use strict';

require('setimmediate');

var RingBuffer = require('ceci-buffers').impl.RingBuffer;
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


var Ceci = module.exports = {};

Ceci.longStackSupport = false;


Ceci.defer = function() {
  return new Deferred();
};


Ceci.go = function(generator) {
  var args    = Array.prototype.slice.call(arguments, 1);
  var gen     = generator.apply(undefined, args);
  var result  = Ceci.defer();
  var succeed = function(val) { enqueue(function() { use(val, true); }); };
  var fail    = function(val) { enqueue(function() { use(val, false); }); };
  var context = Ceci.longStackSupport ? new Error() : null;

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
      if (context)
        ex.stack = 
        ex.stack.replace(/\s*at GeneratorFunctionPrototype.next .*(\n.*)*/, '')
        + context.stack.replace(/.*/, '');
      result.reject(ex);
      return;
    }
  };

  succeed();
  return result;
};
