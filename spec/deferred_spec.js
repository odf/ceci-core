var cc = require('../index');


var checkOnResolve = function(deferred, expected, done) {
  var resolvedWith = null;

  deferred.then(function(val) { resolvedWith = val; },
                function() {});

  cc.go(function*() {
    yield cc.sleep(1);
    expect(resolvedWith).toEqual(expected);
    done();
  });
};

var checkOnRejected = function(deferred, expected, done) {
  var rejectedWith = null;

  deferred.then(function() {},
                function(msg) { rejectedWith = msg; });

  cc.go(function*() {
    yield cc.sleep(1);
    expect(rejectedWith).toEqual(expected);
    done();
  });
};


describe('a deferred', function() {
  var deferred;

  describe('that has not been resolved', function() {
    beforeEach(function() {
      deferred = cc.defer();
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

    it('does not yield a value', function(done) {
      var yielded = null;

      cc.go(function*() {
        yielded = yield deferred;
      });

      cc.go(function*() {
        yield cc.sleep(1);
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
      deferred = cc.defer();
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
      deferred = cc.defer();
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
});
