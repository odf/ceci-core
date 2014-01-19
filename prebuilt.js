!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ceciCore=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
/**
 * Copyright (c) 2013, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

(function(
  // Reliable reference to the global object (i.e. window in browsers).
  global,

  // Dummy constructor that we use as the .constructor property for
  // functions that return Generator objects.
  GeneratorFunction
) {
  var hasOwn = Object.prototype.hasOwnProperty;

  if (global.wrapGenerator) {
    return;
  }

  function wrapGenerator(innerFn, self) {
    return new Generator(innerFn, self || null);
  }

  global.wrapGenerator = wrapGenerator;
  if (typeof exports !== "undefined") {
    exports.wrapGenerator = wrapGenerator;
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  wrapGenerator.mark = function(genFun) {
    genFun.constructor = GeneratorFunction;
    return genFun;
  };

  // Ensure isGeneratorFunction works when Function#name not supported.
  if (GeneratorFunction.name !== "GeneratorFunction") {
    GeneratorFunction.name = "GeneratorFunction";
  }

  wrapGenerator.isGeneratorFunction = function(genFun) {
    var ctor = genFun && genFun.constructor;
    return ctor ? GeneratorFunction.name === ctor.name : false;
  };

  function Generator(innerFn, self) {
    var generator = this;
    var context = new Context();
    var state = GenStateSuspendedStart;

    function invoke() {
      state = GenStateExecuting;
      do {
        var value = innerFn.call(self, context);
      } while (value === ContinueSentinel);
      // If an exception is thrown from innerFn, we leave state ===
      // GenStateExecuting and loop back for another invocation.
      state = context.done
        ? GenStateCompleted
        : GenStateSuspendedYield;
      return { value: value, done: context.done };
    }

    function assertCanInvoke() {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        throw new Error("Generator has already finished");
      }
    }

    function handleDelegate(method, arg) {
      var delegate = context.delegate;
      if (delegate) {
        try {
          var info = delegate.generator[method](arg);
        } catch (uncaught) {
          context.delegate = null;
          return generator.throw(uncaught);
        }

        if (info) {
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            return info;
          }
        }

        context.delegate = null;
      }
    }

    generator.next = function(value) {
      assertCanInvoke();

      var delegateInfo = handleDelegate("next", value);
      if (delegateInfo) {
        return delegateInfo;
      }

      if (state === GenStateSuspendedYield) {
        context.sent = value;
      }

      while (true) try {
        return invoke();
      } catch (exception) {
        context.dispatchException(exception);
      }
    };

    generator.throw = function(exception) {
      assertCanInvoke();

      var delegateInfo = handleDelegate("throw", exception);
      if (delegateInfo) {
        return delegateInfo;
      }

      if (state === GenStateSuspendedStart) {
        state = GenStateCompleted;
        throw exception;
      }

      while (true) {
        context.dispatchException(exception);
        try {
          return invoke();
        } catch (thrown) {
          exception = thrown;
        }
      }
    };
  }

  Generator.prototype.toString = function() {
    return "[object Generator]";
  };

  function Context() {
    this.reset();
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.next = 0;
      this.sent = void 0;
      this.tryStack = [];
      this.done = false;
      this.delegate = null;

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      if (hasOwn.call(this, "thrown")) {
        var thrown = this.thrown;
        delete this.thrown;
        throw thrown;
      }

      return this.rval;
    },

    keys: function(object) {
      return Object.keys(object).reverse();
    },

    pushTry: function(catchLoc, finallyLoc, finallyTempVar) {
      if (finallyLoc) {
        this.tryStack.push({
          finallyLoc: finallyLoc,
          finallyTempVar: finallyTempVar
        });
      }

      if (catchLoc) {
        this.tryStack.push({
          catchLoc: catchLoc
        });
      }
    },

    popCatch: function(catchLoc) {
      var lastIndex = this.tryStack.length - 1;
      var entry = this.tryStack[lastIndex];

      if (entry && entry.catchLoc === catchLoc) {
        this.tryStack.length = lastIndex;
      }
    },

    popFinally: function(finallyLoc) {
      var lastIndex = this.tryStack.length - 1;
      var entry = this.tryStack[lastIndex];

      if (!entry || !hasOwn.call(entry, "finallyLoc")) {
        entry = this.tryStack[--lastIndex];
      }

      if (entry && entry.finallyLoc === finallyLoc) {
        this.tryStack.length = lastIndex;
      }
    },

    dispatchException: function(exception) {
      var finallyEntries = [];
      var dispatched = false;

      if (this.done) {
        throw exception;
      }

      // Dispatch the exception to the "end" location by default.
      this.thrown = exception;
      this.next = "end";

      for (var i = this.tryStack.length - 1; i >= 0; --i) {
        var entry = this.tryStack[i];
        if (entry.catchLoc) {
          this.next = entry.catchLoc;
          dispatched = true;
          break;
        } else if (entry.finallyLoc) {
          finallyEntries.push(entry);
          dispatched = true;
        }
      }

      while ((entry = finallyEntries.pop())) {
        this[entry.finallyTempVar] = this.next;
        this.next = entry.finallyLoc;
      }
    },

    delegateYield: function(generator, resultName, nextLoc) {
      var info = generator.next(this.sent);

      if (info.done) {
        this.delegate = null;
        this[resultName] = info.value;
        this.next = nextLoc;

        return ContinueSentinel;
      }

      this.delegate = {
        generator: generator,
        resultName: resultName,
        nextLoc: nextLoc
      };

      return info.value;
    }
  };
}).apply(this, Function("return [this, function GeneratorFunction(){}]")());

},{}],3:[function(require,module,exports){
var process=require("__browserify_process"),global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};(function (global, undefined) {
    "use strict";

    var tasks = (function () {
        function Task(handler, args) {
            this.handler = handler;
            this.args = args;
        }
        Task.prototype.run = function () {
            // See steps in section 5 of the spec.
            if (typeof this.handler === "function") {
                // Choice of `thisArg` is not in the setImmediate spec; `undefined` is in the setTimeout spec though:
                // http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html
                this.handler.apply(undefined, this.args);
            } else {
                var scriptSource = "" + this.handler;
                /*jshint evil: true */
                eval(scriptSource);
            }
        };

        var nextHandle = 1; // Spec says greater than zero
        var tasksByHandle = {};
        var currentlyRunningATask = false;

        return {
            addFromSetImmediateArguments: function (args) {
                var handler = args[0];
                var argsToHandle = Array.prototype.slice.call(args, 1);
                var task = new Task(handler, argsToHandle);

                var thisHandle = nextHandle++;
                tasksByHandle[thisHandle] = task;
                return thisHandle;
            },
            runIfPresent: function (handle) {
                // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
                // So if we're currently running a task, we'll need to delay this invocation.
                if (!currentlyRunningATask) {
                    var task = tasksByHandle[handle];
                    if (task) {
                        currentlyRunningATask = true;
                        try {
                            task.run();
                        } finally {
                            delete tasksByHandle[handle];
                            currentlyRunningATask = false;
                        }
                    }
                } else {
                    // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
                    // "too much recursion" error.
                    global.setTimeout(function () {
                        tasks.runIfPresent(handle);
                    }, 0);
                }
            },
            remove: function (handle) {
                delete tasksByHandle[handle];
            }
        };
    }());

    function canUseNextTick() {
        // Don't get fooled by e.g. browserify environments.
        return typeof process === "object" &&
               Object.prototype.toString.call(process) === "[object process]";
    }

    function canUseMessageChannel() {
        return !!global.MessageChannel;
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.

        if (!global.postMessage || global.importScripts) {
            return false;
        }

        var postMessageIsAsynchronous = true;
        var oldOnMessage = global.onmessage;
        global.onmessage = function () {
            postMessageIsAsynchronous = false;
        };
        global.postMessage("", "*");
        global.onmessage = oldOnMessage;

        return postMessageIsAsynchronous;
    }

    function canUseReadyStateChange() {
        return "document" in global && "onreadystatechange" in global.document.createElement("script");
    }

    function installNextTickImplementation(attachTo) {
        attachTo.setImmediate = function () {
            var handle = tasks.addFromSetImmediateArguments(arguments);

            process.nextTick(function () {
                tasks.runIfPresent(handle);
            });

            return handle;
        };
    }

    function installMessageChannelImplementation(attachTo) {
        var channel = new global.MessageChannel();
        channel.port1.onmessage = function (event) {
            var handle = event.data;
            tasks.runIfPresent(handle);
        };
        attachTo.setImmediate = function () {
            var handle = tasks.addFromSetImmediateArguments(arguments);

            channel.port2.postMessage(handle);

            return handle;
        };
    }

    function installPostMessageImplementation(attachTo) {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var MESSAGE_PREFIX = "com.bn.NobleJS.setImmediate" + Math.random();

        function isStringAndStartsWith(string, putativeStart) {
            return typeof string === "string" && string.substring(0, putativeStart.length) === putativeStart;
        }

        function onGlobalMessage(event) {
            // This will catch all incoming messages (even from other windows!), so we need to try reasonably hard to
            // avoid letting anyone else trick us into firing off. We test the origin is still this window, and that a
            // (randomly generated) unpredictable identifying prefix is present.
            if (event.source === global && isStringAndStartsWith(event.data, MESSAGE_PREFIX)) {
                var handle = event.data.substring(MESSAGE_PREFIX.length);
                tasks.runIfPresent(handle);
            }
        }
        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        attachTo.setImmediate = function () {
            var handle = tasks.addFromSetImmediateArguments(arguments);

            // Make `global` post a message to itself with the handle and identifying prefix, thus asynchronously
            // invoking our onGlobalMessage listener above.
            global.postMessage(MESSAGE_PREFIX + handle, "*");

            return handle;
        };
    }

    function installReadyStateChangeImplementation(attachTo) {
        attachTo.setImmediate = function () {
            var handle = tasks.addFromSetImmediateArguments(arguments);

            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var scriptEl = global.document.createElement("script");
            scriptEl.onreadystatechange = function () {
                tasks.runIfPresent(handle);

                scriptEl.onreadystatechange = null;
                scriptEl.parentNode.removeChild(scriptEl);
                scriptEl = null;
            };
            global.document.documentElement.appendChild(scriptEl);

            return handle;
        };
    }

    function installSetTimeoutImplementation(attachTo) {
        attachTo.setImmediate = function () {
            var handle = tasks.addFromSetImmediateArguments(arguments);

            global.setTimeout(function () {
                tasks.runIfPresent(handle);
            }, 0);

            return handle;
        };
    }

    if (!global.setImmediate) {
        // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
        var attachTo = typeof Object.getPrototypeOf === "function" && "setTimeout" in Object.getPrototypeOf(global) ?
                          Object.getPrototypeOf(global)
                        : global;

        if (canUseNextTick()) {
            // For Node.js before 0.9
            installNextTickImplementation(attachTo);
        } else if (canUsePostMessage()) {
            // For non-IE10 modern browsers
            installPostMessageImplementation(attachTo);
        } else if (canUseMessageChannel()) {
            // For web workers, where supported
            installMessageChannelImplementation(attachTo);
        } else if (canUseReadyStateChange()) {
            // For IE 6–8
            installReadyStateChangeImplementation(attachTo);
        } else {
            // For older browsers
            installSetTimeoutImplementation(attachTo);
        }

        attachTo.clearImmediate = tasks.remove;
    }
}(typeof global === "object" && global ? global : this));

},{"__browserify_process":1}],4:[function(require,module,exports){
'use strict';


const PENDING  = 0;
const RESOLVED = 1;
const REJECTED = 2;


function Deferred() {
  this.onResolve = null;
  this.onReject  = null;
  this.state     = PENDING;
  this.value     = undefined;
};

Deferred.prototype.then = function(onResolve, onReject) {
  if (this.onResolve != null || this.onReject != null)
    onReject(new Error('deferred has already been subscribed to'));
  else {
    this.onResolve = onResolve;
    this.onReject  = onReject;
    this.publish();
  }
}

Deferred.prototype.resolve = function(val) {
  this.update(RESOLVED, val);
};

Deferred.prototype.reject = function(cause) {
  this.update(REJECTED, cause);
};

Deferred.prototype.isResolved = function() {
  return this.state != PENDING;
};

Deferred.prototype.update = function(state, val) {
  if (this.isResolved())
    throw new Error('deferred is already resolved');

  this.state = state;
  this.value = val;
  this.publish();
};

Deferred.prototype.publish = function() {
  if (this.state == RESOLVED && this.onResolve)
    this.onResolve(this.value);
  else if (this.state == REJECTED && this.onReject)
    this.onReject(this.value);
};


module.exports = Deferred;

},{}],5:[function(require,module,exports){
'use strict';


function RingBuffer(size) {
  this.size = size;
  this.data_start = 0;
  this.data_count = 0;
  this.data = new Array(size);
};

RingBuffer.prototype.capacity = function() {
  return this.size;
};

RingBuffer.prototype.count = function() {
  return this.data_count;
};

RingBuffer.prototype.isEmpty = function() {
  return this.data_count == 0;
};

RingBuffer.prototype.isFull = function() {
  return this.data_count == this.size;
};

RingBuffer.prototype.write = function(val) {
  var pos = (this.data_start + this.data_count) % this.size;
  this.data[pos] = val;
  if (this.data_count < this.size)
    this.data_count += 1;
  else
    this.data_start = (this.data_start + 1) % this.size;
};

RingBuffer.prototype.read = function() {
  var val = this.data[this.data_start];
  this.data_start = (this.data_start + 1) % this.size;
  this.data_count = Math.max(this.data_count - 1, 0);
  return val;
};

RingBuffer.prototype.resize = function(n) {
  var new_data = new Array(n);
  for (var i = 0; i < this.data_count; ++i)
    new_data[i % n] = this.data[(this.data_start + i) % this.size];
  this.size = n;
  this.data_start = 0;
  this.data_count = Math.min(this.data_count, this.size);
  this.data = new_data;
};


module.exports = RingBuffer;

},{}],6:[function(require,module,exports){
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
  defer: defer,
  go   : go
};

},{"./Deferred":4,"./RingBuffer":5,"setimmediate":3}],7:[function(require,module,exports){
'use strict';

var extend = function(obj, other) {
  for (var p in other)
    obj[p] = other[p];
};

exports.RingBuffer = require('./RingBuffer');

extend(exports, require('./core'));
extend(exports, require('./util'));



},{"./RingBuffer":5,"./core":6,"./util":8}],8:[function(require,module,exports){
var wrapGenerator = require('regeneratorify/runtime').wrapGenerator;
'use strict';

var cc = require('./core');


var lift = function(fn, context) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    return cc.go(wrapGenerator.mark(function() {
      var i;

      return wrapGenerator(function($ctx) {
        while (1) switch ($ctx.next) {
        case 0:
          i = 0;
        case 1:
          if (!(i < args.length)) {
            $ctx.next = 8;
            break;
          }

          $ctx.next = 4;
          return args[i];
        case 4:
          args[i] = $ctx.sent;
        case 5:
          ++i;
          $ctx.next = 1;
          break;
        case 8:
          $ctx.rval = fn.apply(context, args);
          delete $ctx.thrown;
          $ctx.next = 12;
          break;
        case 12:
        case "end":
          return $ctx.stop();
        }
      }, this);
    }));
  };
};


var chain = function(initial) {
  var args = Array.prototype.slice.call(arguments, 1);

  return cc.go(wrapGenerator.mark(function() {
    var val, form, i;

    return wrapGenerator(function($ctx) {
      while (1) switch ($ctx.next) {
      case 0:
        val = initial;
        i = 0;
      case 2:
        if (!(i < args.length)) {
          $ctx.next = 11;
          break;
        }

        form = args[i];
        $ctx.next = 6;
        return val;
      case 6:
        val = $ctx.sent;

        if (typeof form == 'function')
          val = form(val);
        else if (Array.isArray(form) && typeof form[0] == 'function')
          val = form[0].apply(null, [].concat(form[1], [val], form.slice(2)));
        else
          val = form;
      case 8:
        ++i;
        $ctx.next = 2;
        break;
      case 11:
        $ctx.next = 13;
        return val;
      case 13:
        $ctx.rval = $ctx.sent;
        delete $ctx.thrown;
        $ctx.next = 17;
        break;
      case 17:
      case "end":
        return $ctx.stop();
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

},{"./core":6,"regeneratorify/runtime":2}]},{},[7])
(7)
});