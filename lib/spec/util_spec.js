'use strict';

var cc = require('../index');

var t = function(val) {
  var out = cc.defer();
  cc.go(wrapGenerator.mark(function() {
    return wrapGenerator(function($ctx0) {
      while (1) switch ($ctx0.next) {
      case 0:
        $ctx0.next = 2;
        return null;
      case 2:
        out.resolve(val);
      case 3:
      case "end":
        return $ctx0.stop();
      }
    }, this);
  }));
  return out;
};


describe('the lift function', function() {
  it('lifts an ordinary function to a function on deferreds', function(done) {
    cc.go(wrapGenerator.mark(function() {
      var a;

      return wrapGenerator(function($ctx1) {
        while (1) switch ($ctx1.next) {
        case 0:
          a = cc.lift(Array)(t(1), t(2), t(3));
          expect(typeof a.then).toEqual('function');
          $ctx1.next = 4;
          return a;
        case 4:
          $ctx1.t0 = $ctx1.sent;
          expect($ctx1.t0).toEqual([1,2,3]);
          done();
        case 7:
        case "end":
          return $ctx1.stop();
        }
      }, this);
    }));
  });

  it('handles a passed in object context correctly', function(done) {
    var obj = {
      val: 287,
      fun: function(x) { return this.val + x; }
    };

    cc.go(wrapGenerator.mark(function() {
      return wrapGenerator(function($ctx2) {
        while (1) switch ($ctx2.next) {
        case 0:
          $ctx2.next = 2;
          return cc.lift(obj.fun, obj)(t(314));
        case 2:
          $ctx2.t1 = $ctx2.sent;
          expect($ctx2.t1).toEqual(601);
          done();
        case 5:
        case "end":
          return $ctx2.stop();
        }
      }, this);
    }));
  });
});


describe('the chain function', function() {
  var fn = function() {
    var args = Array.prototype.slice.call(arguments);
    return cc.go(wrapGenerator.mark(function() {
      return wrapGenerator(function($ctx3) {
        while (1) switch ($ctx3.next) {
        case 0:
          $ctx3.rval = '#' + args.join('#') + '#';
          delete $ctx3.thrown;
          $ctx3.next = 4;
          break;
        case 4:
        case "end":
          return $ctx3.stop();
        }
      }, this);
    }));
  };

  it('when given only an initial value, returns it unchanged', function(done) {
    cc.go(wrapGenerator.mark(function() {
      return wrapGenerator(function($ctx4) {
        while (1) switch ($ctx4.next) {
        case 0:
          $ctx4.next = 2;
          return cc.chain(5);
        case 2:
          $ctx4.t2 = $ctx4.sent;
          expect($ctx4.t2).toEqual(5);
          done();
        case 5:
        case "end":
          return $ctx4.stop();
        }
      }, this);
    }));
  });

  it('when given a single form, applies it', function(done) {
    cc.go(wrapGenerator.mark(function() {
      return wrapGenerator(function($ctx5) {
        while (1) switch ($ctx5.next) {
        case 0:
          $ctx5.next = 2;
          return cc.chain(5, fn);
        case 2:
          $ctx5.t3 = $ctx5.sent;
          expect($ctx5.t3).toEqual('#5#');
          $ctx5.next = 6;
          return cc.chain(5, ['toString', 2]);
        case 6:
          $ctx5.t4 = $ctx5.sent;
          expect($ctx5.t4).toEqual('101');
          $ctx5.next = 10;
          return cc.chain(5, [fn, [], 7, 11]);
        case 10:
          $ctx5.t5 = $ctx5.sent;
          expect($ctx5.t5).toEqual('#5#7#11#');
          $ctx5.next = 14;
          return cc.chain(5, [fn, 3]);
        case 14:
          $ctx5.t6 = $ctx5.sent;
          expect($ctx5.t6).toEqual('#3#5#');
          $ctx5.next = 18;
          return cc.chain(5, [fn, [2,3]]);
        case 18:
          $ctx5.t7 = $ctx5.sent;
          expect($ctx5.t7).toEqual('#2#3#5#');
          $ctx5.next = 22;
          return cc.chain(5, [fn, 3, 7, 11]);
        case 22:
          $ctx5.t8 = $ctx5.sent;
          expect($ctx5.t8).toEqual('#3#5#7#11#');
          $ctx5.next = 26;
          return cc.chain(5, [fn, [2, 3], 7, 11]);
        case 26:
          $ctx5.t9 = $ctx5.sent;
          expect($ctx5.t9).toEqual('#2#3#5#7#11#');
          done();
        case 29:
        case "end":
          return $ctx5.stop();
        }
      }, this);
    }));
  });

  it('when given multiple forms, applies them in order', function(done) {
    var toInt = function(s) { return parseInt(s); };

    cc.go(wrapGenerator.mark(function() {
      return wrapGenerator(function($ctx6) {
        while (1) switch ($ctx6.next) {
        case 0:
          $ctx6.next = 2;

          return cc.chain(5,
                                [fn, [2, 3], 7, 11],
                                ['split', '#'],
                                ['slice', 1, 6],
                                ['map', toInt]);
        case 2:
          $ctx6.t10 = $ctx6.sent;
          expect($ctx6.t10).toEqual([2, 3, 5, 7, 11]);
          done();
        case 5:
        case "end":
          return $ctx6.stop();
        }
      }, this);
    }));
  });

  it('interprets non-form arguments as replacement values', function(done) {
    cc.go(wrapGenerator.mark(function() {
      return wrapGenerator(function($ctx7) {
        while (1) switch ($ctx7.next) {
        case 0:
          $ctx7.next = 2;
          return cc.chain(5, [fn, 3, 7], 'hello', [fn, 2, 9]);
        case 2:
          $ctx7.t11 = $ctx7.sent;
          expect($ctx7.t11).toEqual('#2#hello#9#');
          done();
        case 5:
        case "end":
          return $ctx7.stop();
        }
      }, this);
    }));
  });
});


describe('the sleep function', function() {
  it('delays execution for approximately the specified time', function(done) {
    cc.go(wrapGenerator.mark(function() {
      var d, t;

      return wrapGenerator(function($ctx8) {
        while (1) switch ($ctx8.next) {
        case 0:
          d = 17;
          t = Date.now();
          $ctx8.next = 4;
          return cc.sleep(d);
        case 4:
          expect(Math.abs(Date.now() - t - d)).toBeLessThan(2);
          done();
        case 6:
        case "end":
          return $ctx8.stop();
        }
      }, this);
    }));
  });
});


describe('the ncallback function returns a callback that', function() {
  var result, cb;

  beforeEach(function() {
    result = cc.defer();
    cb = cc.ncallback(result);
  });

  it('when called with no error, resolves its deferred', function(done) {
    cb(null, 5);
    cc.go(wrapGenerator.mark(function() {
      return wrapGenerator(function($ctx9) {
        while (1) switch ($ctx9.next) {
        case 0:
          $ctx9.next = 2;
          return result;
        case 2:
          $ctx9.t12 = $ctx9.sent;
          expect($ctx9.t12).toEqual(5);
          done();
        case 5:
        case "end":
          return $ctx9.stop();
        }
      }, this);
    }));
  });

  it('when called with an error, rejects its deferred', function(done) {
    cb('Nope!');
    cc.go(wrapGenerator.mark(function() {
      var thrown;

      return wrapGenerator(function($ctx10) {
        while (1) switch ($ctx10.next) {
        case 0:
          thrown = {};
          $ctx10.pushTry(7, null, null);
          $ctx10.next = 4;
          return result;
        case 4:
          $ctx10.popCatch(7);
          $ctx10.next = 11;
          break;
        case 7:
          $ctx10.popCatch(7);
          $ctx10.t13 = $ctx10.thrown;
          delete $ctx10.thrown;
          thrown = $ctx10.t13;
        case 11:
          expect(thrown.message).toEqual('Nope!');
          done();
        case 13:
        case "end":
          return $ctx10.stop();
        }
      }, this);
    }));
  });
});


describe('the nbind function returns a wrapper that', function() {
  var obj = {
    value: 5,

    method: function(x, cb) {
      if (x != this.value)
        cb('expecting a ' + this.value);
      else
        cb(null, 'thanks for the ' + this.value);
    }
  };

  var wrapper = cc.nbind(obj.method, obj);

  it('upon success resolves the deferred it returns', function(done) {
    var val = obj.value;
    cc.go(wrapGenerator.mark(function() {
      return wrapGenerator(function($ctx11) {
        while (1) switch ($ctx11.next) {
        case 0:
          $ctx11.next = 2;
          return wrapper(val);
        case 2:
          $ctx11.t14 = $ctx11.sent;
          $ctx11.t15 = 'thanks for the ' + val;
          expect($ctx11.t14).toEqual($ctx11.t15);
          done();
        case 6:
        case "end":
          return $ctx11.stop();
        }
      }, this);
    }));
  });

  it('upon success rejects the deferred it returns', function(done) {
    var val = obj.value + 1;
    cc.go(wrapGenerator.mark(function() {
      var thrown;

      return wrapGenerator(function($ctx12) {
        while (1) switch ($ctx12.next) {
        case 0:
          thrown = {};
          $ctx12.pushTry(7, null, null);
          $ctx12.next = 4;
          return wrapper(val);
        case 4:
          $ctx12.popCatch(7);
          $ctx12.next = 11;
          break;
        case 7:
          $ctx12.popCatch(7);
          $ctx12.t16 = $ctx12.thrown;
          delete $ctx12.thrown;
          thrown = $ctx12.t16;
        case 11:
          expect(thrown.message).toEqual('expecting a ' + obj.value);
          done();
        case 13:
        case "end":
          return $ctx12.stop();
        }
      }, this);
    }));
  });
});


describe('the nodeify function', function() {
  var result;

  beforeEach(function() {
    result = cc.defer();
  });

  describe('when given a callback', function() {
    var outcome;

    beforeEach(function() {
      outcome = null;

      cc.nodeify(result, function(err, val) {
        outcome = err ? { err: err } : { val: val };
      });
    });

    it('calls it with no error upon deferred resolution', function(done) {
      result.resolve('Hello callback!');
      cc.go(wrapGenerator.mark(function() {
        return wrapGenerator(function($ctx13) {
          while (1) switch ($ctx13.next) {
          case 0:
            expect(outcome).toEqual({ val: 'Hello callback!' });
            done();
          case 2:
          case "end":
            return $ctx13.stop();
          }
        }, this);
      }));
    });

    it('calls it with an error upon deferred rejection', function(done) {
      result.reject('O noes!');
      cc.go(wrapGenerator.mark(function() {
        return wrapGenerator(function($ctx14) {
          while (1) switch ($ctx14.next) {
          case 0:
            expect(outcome).toEqual({ err: 'O noes!' });
            done();
          case 2:
          case "end":
            return $ctx14.stop();
          }
        }, this);
      }));
    });
  });

  describe('when given no callback', function() {
    it('simply returns its argument', function() {
      expect(cc.nodeify(result)).toBe(result);
    });
  });
});
