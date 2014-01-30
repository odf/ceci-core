'use strict';

var cc = require('../index');


var delay = function(action) {
  cc.go(function*() {
    yield cc.sleep(1);
    action();
  });
};

var checkOnResolve = function(deferred, expected, done) {
  var resolvedWith = null;

  deferred.then(function(val) { resolvedWith = val; },
                function() {});

  delay(function() { expect(resolvedWith).toEqual(expected); done(); });
};

var checkOnRejected = function(deferred, expected, done) {
  var rejectedWith = null;

  deferred.then(function() {},
                function(msg) { rejectedWith = msg; });

  delay(function() { expect(rejectedWith).toEqual(expected); done(); });
};


describe('a deferred', function() {
  var deferred;

  beforeEach(function() {
    deferred = cc.defer();
  });

  describe('that has not been resolved', function() {
    it('can be resolved', function() {
      expect(function() { deferred.resolve(); }).not.toThrow();
    });

    it('can be rejected', function() {
      expect(function() { deferred.reject(); }).not.toThrow();
    });

    it('reports itself as unresolved', function() {
      expect(deferred.isResolved()).toBeFalsy();
    });

    it('does not yield a value', function(done) {
      var yielded = null;

      cc.go(function*() {
        yielded = yield deferred;
      });

      delay(function() {
        expect(yielded).toBe(null);
        done();
      });
    });

    it('does not call its onResolve function', function(done) {
      checkOnResolve(deferred, null, done);
    });

    it('does not call its onReject function', function(done) {
      checkOnRejected(deferred, null, done);
    });
  });

  describe('that has been resolved with a value', function() {
    var val = { oh: 'see' };

    beforeEach(function() {
      deferred.resolve(val);
    });

    it('cannot be resolved', function() {
      expect(function() { deferred.resolve(); }).toThrow();
    });

    it('cannot be rejected', function() {
      expect(function() { deferred.reject(); }).toThrow();
    });

    it('reports itself as resolved', function() {
      expect(deferred.isResolved()).toBeTruthy();
    });

    it('yields that value', function(done) {
      cc.go(function*() {
        expect(yield deferred).toEqual(val);
        done();
      });
    });

    it('calls its onResolve function', function(done) {
      checkOnResolve(deferred, val, done);
    });

    it('does not call its onReject function', function(done) {
      checkOnRejected(deferred, null, done);
    });
  });

  describe('that has been rejected with an error message', function() {
    var msg = "Oops!";

    beforeEach(function() {
      deferred.reject(msg);
    });

    it('cannot be resolved', function() {
      expect(function() { deferred.resolve(); }).toThrow();
    });

    it('cannot be rejected', function() {
      expect(function() { deferred.reject(); }).toThrow();
    });

    it('reports itself as resolved', function() {
      expect(deferred.isResolved()).toBeTruthy();
    });

    it('throws upon a yield', function(done) {
      cc.go(function*() {
        var thrown = null;
        try {
          yield deferred;
        } catch(ex) {
          thrown = ex;
        }
        expect(thrown).toEqual(msg);
        done();
      });
    });

    it('does not call its onResolve function', function(done) {
      checkOnResolve(deferred, null, done);
    });

    it('calls its onReject function', function(done) {
      checkOnRejected(deferred, msg, done);
    });
  });

  describe('that has been subscribed to', function() {
    var resolvedWith;
    var rejectedWith;

    beforeEach(function() {
      resolvedWith = null;
      rejectedWith = null;
      deferred.then(function(val) { resolvedWith = val; },
                    function(msg) { rejectedWith = msg; });
    });

    it('can be resolved', function() {
      expect(function() { deferred.resolve(); }).not.toThrow();
    });

    it('can be rejected', function() {
      expect(function() { deferred.reject(); }).not.toThrow();
    });

    it('reports itself as unresolved', function() {
      expect(deferred.isResolved()).toBeFalsy();
    });

    it('cannot be used in a yield', function(done) {
      cc.go(function*() {
        var thrown = null;
        try {
          yield deferred;
        } catch(ex) {
          thrown = ex;
        }
        expect(thrown).not.toEqual(null);
        done();
      });
    });

    it('cannot be subscribed to again', function() {
      expect(function() { deferred.then() }).toThrow();
    });

    it('calls only its onResolve function when resolved', function() {
      var val = { oh: 'my' };
      deferred.resolve(val);
      expect(resolvedWith).toEqual(val);
      expect(rejectedWith).toBe(null);
    });

    it('calls only its onReject function when rejected', function() {
      var msg = "Nope!";
      deferred.reject(msg);
      expect(resolvedWith).toBe(null);
      expect(rejectedWith).toEqual(msg);
    });
  });

  describe('that has been used in a yield', function() {
    var resolvedWith;
    var rejectedWith;

    beforeEach(function() {
      resolvedWith = null;
      rejectedWith = null;
      cc.go(function*() {
        try {
          resolvedWith = yield deferred;
        } catch(ex) {
          rejectedWith = ex;
        }
      });
    });

    it('can be resolved', function(done) {
      delay(function() {
        expect(function() { deferred.resolve(); }).not.toThrow();
        done();
      });
    });

    it('can be rejected', function(done) {
      delay(function() {
        expect(function() { deferred.reject(); }).not.toThrow();
        done();
      });
    });

    it('reports itself as unresolved', function(done) {
      delay(function() {
        expect(deferred.isResolved()).toBeFalsy();
        done();
      });
    });

    it('cannot be used in another yield', function(done) {
      cc.go(function*() {
        var thrown = null;
        try {
          yield deferred;
        } catch(ex) {
          thrown = ex;
        }
        expect(thrown).not.toEqual(null);
        done();
      });
    });

    it('cannot be subscribed to', function(done) {
      delay(function() {
        expect(function() { deferred.then() }).toThrow();
        done();
      });
    });

    it('completes the yield when resolved', function(done) {
      var val = { oh: 'my' };
      deferred.resolve(val);

      delay(function() {
        expect(resolvedWith).toEqual(val);
        expect(rejectedWith).toBe(null);
        done();
      });
    });

    it('throws within the yielding go block when rejected', function(done) {
      var msg = "Nope!";
      deferred.reject(msg);

      delay(function() {
        expect(resolvedWith).toBe(null);
        expect(rejectedWith).toEqual(msg);
        done();
      });
    });
  });
});
