'use strict';

var cc = require('../index');


var delay = function(action) {
  cc.go(wrapGenerator.mark(function() {
    return wrapGenerator(function($ctx0) {
      while (1) switch ($ctx0.next) {
      case 0:
        $ctx0.next = 2;
        return cc.sleep(1);
      case 2:
        action();
      case 3:
      case "end":
        return $ctx0.stop();
      }
    }, this);
  }));
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

      cc.go(wrapGenerator.mark(function() {
        return wrapGenerator(function($ctx1) {
          while (1) switch ($ctx1.next) {
          case 0:
            $ctx1.next = 2;
            return deferred;
          case 2:
            yielded = $ctx1.sent;
          case 3:
          case "end":
            return $ctx1.stop();
          }
        }, this);
      }));

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
      cc.go(wrapGenerator.mark(function() {
        return wrapGenerator(function($ctx2) {
          while (1) switch ($ctx2.next) {
          case 0:
            $ctx2.next = 2;
            return deferred;
          case 2:
            $ctx2.t0 = $ctx2.sent;
            expect($ctx2.t0).toEqual(val);
            done();
          case 5:
          case "end":
            return $ctx2.stop();
          }
        }, this);
      }));
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
      cc.go(wrapGenerator.mark(function() {
        var thrown;

        return wrapGenerator(function($ctx3) {
          while (1) switch ($ctx3.next) {
          case 0:
            thrown = null;
            $ctx3.pushTry(7, null, null);
            $ctx3.next = 4;
            return deferred;
          case 4:
            $ctx3.popCatch(7);
            $ctx3.next = 11;
            break;
          case 7:
            $ctx3.popCatch(7);
            $ctx3.t1 = $ctx3.thrown;
            delete $ctx3.thrown;
            thrown = $ctx3.t1;
          case 11:
            expect(thrown).toEqual(msg);
            done();
          case 13:
          case "end":
            return $ctx3.stop();
          }
        }, this);
      }));
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
      cc.go(wrapGenerator.mark(function() {
        var thrown;

        return wrapGenerator(function($ctx4) {
          while (1) switch ($ctx4.next) {
          case 0:
            thrown = null;
            $ctx4.pushTry(7, null, null);
            $ctx4.next = 4;
            return deferred;
          case 4:
            $ctx4.popCatch(7);
            $ctx4.next = 11;
            break;
          case 7:
            $ctx4.popCatch(7);
            $ctx4.t2 = $ctx4.thrown;
            delete $ctx4.thrown;
            thrown = $ctx4.t2;
          case 11:
            expect(thrown).not.toEqual(null);
            done();
          case 13:
          case "end":
            return $ctx4.stop();
          }
        }, this);
      }));
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
      cc.go(wrapGenerator.mark(function() {
        return wrapGenerator(function($ctx5) {
          while (1) switch ($ctx5.next) {
          case 0:
            $ctx5.pushTry(7, null, null);
            $ctx5.next = 3;
            return deferred;
          case 3:
            resolvedWith = $ctx5.sent;
            $ctx5.popCatch(7);
            $ctx5.next = 11;
            break;
          case 7:
            $ctx5.popCatch(7);
            $ctx5.t3 = $ctx5.thrown;
            delete $ctx5.thrown;
            rejectedWith = $ctx5.t3;
          case 11:
          case "end":
            return $ctx5.stop();
          }
        }, this);
      }));
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
      cc.go(wrapGenerator.mark(function() {
        var thrown;

        return wrapGenerator(function($ctx6) {
          while (1) switch ($ctx6.next) {
          case 0:
            thrown = null;
            $ctx6.pushTry(7, null, null);
            $ctx6.next = 4;
            return deferred;
          case 4:
            $ctx6.popCatch(7);
            $ctx6.next = 11;
            break;
          case 7:
            $ctx6.popCatch(7);
            $ctx6.t4 = $ctx6.thrown;
            delete $ctx6.thrown;
            thrown = $ctx6.t4;
          case 11:
            expect(thrown).not.toEqual(null);
            done();
          case 13:
          case "end":
            return $ctx6.stop();
          }
        }, this);
      }));
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
