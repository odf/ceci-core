'use strict';

var cc = require('../index');

var t = function(val) {
  var out = cc.defer();
  cc.go(function*() {
    yield null;
    out.resolve(val);
  });
  return out;
};


describe('the lift function', function() {
  it('lifts an ordinary function to a function on deferreds', function(done) {
    cc.go(function*() {
      var a = cc.lift(Array)(t(1), t(2), t(3));
      expect(typeof a.then).toEqual('function');
      expect(yield a).toEqual([1,2,3]);
      done();
    });
  });

  it('handles a passed in object context correctly', function(done) {
    var obj = {
      val: 287,
      fun: function(x) { return this.val + x; }
    };

    cc.go(function*() {
      expect(yield cc.lift(obj.fun, obj)(t(314))).toEqual(601);
      done();
    });
  });
});


describe('the sleep function', function() {
  it('delays execution for approximately the specified time', function(done) {
    cc.go(function*() {
      var d = 17;
      var t = Date.now();
      yield cc.sleep(d);
      expect(Math.abs(Date.now() - t - d)).toBeLessThan(2);
      done();
    });
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
    cc.go(function*() {
      expect(yield result).toEqual(5);
      done();
    });
  });

  it('when called with an error, rejects its deferred', function(done) {
    cb('Nope!');
    cc.go(function*() {
      var thrown = {};
      try {
        yield result;
      } catch(ex) {
        thrown = ex;
      }
      expect(thrown.message).toEqual('Nope!');
      done();
    });
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
    cc.go(function*() {
      expect(yield wrapper(val)).toEqual('thanks for the ' + val);
      done();
    });
  });

  it('upon success rejects the deferred it returns', function(done) {
    var val = obj.value + 1;
    cc.go(function*() {
      var thrown = {};
      try {
        yield wrapper(val);
      } catch(ex) {
        thrown = ex;
      }
      expect(thrown.message).toEqual('expecting a ' + obj.value);
      done();
    });
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
      cc.go(function*() {
        expect(outcome).toEqual({ val: 'Hello callback!' });
        done();
      });
    });

    it('calls it with an error upon deferred rejection', function(done) {
      result.reject('O noes!');
      cc.go(function*() {
        expect(outcome).toEqual({ err: 'O noes!' });
        done();
      });
    });
  });

  describe('when given no callback', function() {
    it('simply returns its argument', function() {
      expect(cc.nodeify(result)).toBe(result);
    });
  });
});
