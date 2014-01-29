var cc = require('../index');

describe('a deferred', function() {
  var deferred;

  describe('that has not been resolved', function() {
    beforeEach(function() {
      deferred = cc.defer();
    });

    it('it reports itself as unresolved', function() {
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
      var onResolveCalled = false;

      deferred.then(function() { onResolveCalled = true; },
                    function() {});

      cc.go(function*() {
        yield cc.sleep(1);
        expect(onResolveCalled).toBe(false);
        done();
      });
    });

    it('does not call its onReject function', function(done) {
      var onRejectCalled = false;

      deferred.then(function() {},
                    function() { onRejectCalled = true; });

      cc.go(function*() {
        yield cc.sleep(1);
        expect(onRejectCalled).toBe(false);
        done();
      });
    });
  });

  describe('that has been resolved with a value', function() {
    var val = { oh: 'see' };

    beforeEach(function() {
      deferred = cc.defer();
      deferred.resolve(val);
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
      var onResolveCalled = false;

      deferred.then(function() { onResolveCalled = true; },
                    function() {});

      cc.go(function*() {
        yield cc.sleep(1);
        expect(onResolveCalled).toBe(true);
        done();
      });
    });

    it('does not call its onReject function', function(done) {
      var onRejectCalled = false;

      deferred.then(function() {},
                    function() { onRejectCalled = true; });

      cc.go(function*() {
        yield cc.sleep(1);
        expect(onRejectCalled).toBe(false);
        done();
      });
    });
  });

  describe('that has been rejected with an error message', function() {
    var msg = "Oops!";

    beforeEach(function() {
      deferred = cc.defer();
      deferred.reject(msg);
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
      var onResolveCalled = false;

      deferred.then(function() { onResolveCalled = true; },
                    function() {});

      cc.go(function*() {
        yield cc.sleep(1);
        expect(onResolveCalled).toBe(false);
        done();
      });
    });

    it('calls its onReject function', function(done) {
      var onRejectCalled = false;

      deferred.then(function() {},
                    function() { onRejectCalled = true; });

      cc.go(function*() {
        yield cc.sleep(1);
        expect(onRejectCalled).toBe(true);
        done();
      });
    });
  });
});
