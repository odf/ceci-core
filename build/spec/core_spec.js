'use strict';

var cc = require('../index');


describe('a go block', function() {
  it('leaves plain values alone upon a yield', function(done) {
    var val = { the: 'value' };

    cc.go(wrapGenerator.mark(function() {
      return wrapGenerator(function($ctx0) {
        while (1) switch ($ctx0.next) {
        case 0:
          $ctx0.next = 2;
          return val;
        case 2:
          $ctx0.t0 = $ctx0.sent;
          expect($ctx0.t0).toEqual(val);
          done();
        case 5:
        case "end":
          return $ctx0.stop();
        }
      }, this);
    }));
  }),

  it('passes extra arguments into its generator', function(done) {
    cc.go(wrapGenerator.mark(function(a, b) {
      return wrapGenerator(function($ctx1) {
        while (1) switch ($ctx1.next) {
        case 0:
          expect(a + b).toEqual(12);
          done();
        case 2:
        case "end":
          return $ctx1.stop();
        }
      }, this);
    }), 5, 7);
  }),

  it('eventually returns the return value of its generator', function(done) {
    var val = { a: 'value' };

    cc.go(wrapGenerator.mark(function() {
      var x;

      return wrapGenerator(function($ctx2) {
        while (1) switch ($ctx2.next) {
        case 0:
          $ctx2.next = 2;

          return cc.go(wrapGenerator.mark(function() {
            return wrapGenerator(function($ctx3) {
              while (1) switch ($ctx3.next) {
              case 0:
                $ctx3.rval = val;
                delete $ctx3.thrown;
                $ctx3.next = 4;
                break;
              case 4:
              case "end":
                return $ctx3.stop();
              }
            }, this);
          }));
        case 2:
          x = $ctx2.sent;
          expect(x).toEqual(val);
          done();
        case 5:
        case "end":
          return $ctx2.stop();
        }
      }, this);
    }));
  });

  it('passes along uncaught exceptions from its generator', function(done) {
    var msg = 'Ouch!';

    cc.go(wrapGenerator.mark(function() {
      var thrown;

      return wrapGenerator(function($ctx4) {
        while (1) switch ($ctx4.next) {
        case 0:
          thrown = null;
          $ctx4.pushTry(7, null, null);
          $ctx4.next = 4;

          return cc.go(wrapGenerator.mark(function() {
            return wrapGenerator(function($ctx5) {
              while (1) switch ($ctx5.next) {
              case 0:
                throw msg;
              case 1:
              case "end":
                return $ctx5.stop();
              }
            }, this);
          }));
        case 4:
          $ctx4.popCatch(7);
          $ctx4.next = 11;
          break;
        case 7:
          $ctx4.popCatch(7);
          $ctx4.t1 = $ctx4.thrown;
          delete $ctx4.thrown;
          thrown = $ctx4.t1;
        case 11:
          expect(thrown).toEqual(msg);
          done();
        case 13:
        case "end":
          return $ctx4.stop();
        }
      }, this);
    }));
  });

  it('supports arbitrary thenables in a yield', function(done) {
    var val = { hello: 'val' };
    var msg = 'Nah!';

    var succeeding = {
      then: function(onResolved, onReject) {
        onResolved(val);
      }
    };

    var failing = {
      then: function(onResolved, onReject) {
        onReject(msg);
      }
    };

    cc.go(wrapGenerator.mark(function() {
      var thrown;

      return wrapGenerator(function($ctx6) {
        while (1) switch ($ctx6.next) {
        case 0:
          thrown = null;
          $ctx6.pushTry(7, null, null);
          $ctx6.next = 4;
          return failing;
        case 4:
          $ctx6.popCatch(7);
          $ctx6.next = 11;
          break;
        case 7:
          $ctx6.popCatch(7);
          $ctx6.t2 = $ctx6.thrown;
          delete $ctx6.thrown;
          thrown = $ctx6.t2;
        case 11:
          expect(thrown).toEqual(msg);
          $ctx6.next = 14;
          return succeeding;
        case 14:
          $ctx6.t3 = $ctx6.sent;
          expect($ctx6.t3).toEqual(val);
          done();
        case 17:
        case "end":
          return $ctx6.stop();
        }
      }, this);
    }));
  });
});
