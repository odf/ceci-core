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
