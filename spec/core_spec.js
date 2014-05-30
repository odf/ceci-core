'use strict';

var cc = require('../index');

cc.longStackSupport = true;


describe('a go block', function() {
  it('leaves plain values alone upon a yield', function(done) {
    var val = { the: 'value' };

    cc.go(function*() {
      expect(yield val).toEqual(val);
      done();
    });
  }),

  it('passes extra arguments into its generator', function(done) {
    cc.go(
      function*(a, b) {
        expect(a + b).toEqual(12);
        done();
      },
      5, 7);
  }),

  it('eventually returns the return value of its generator', function(done) {
    var val = { a: 'value' };

    cc.go(function*() {
      var x = yield cc.go(function*() {
        return val;
      });
      expect(x).toEqual(val);
      done();
    });
  });

  it('passes along uncaught exceptions from its generator', function(done) {
    var msg = 'Ouch!';

    cc.go(function*() {
      var thrown = null;

      try {
        yield cc.go(function*() {
          throw msg;
        });
      } catch(ex) {
        thrown = ex;
      }

      expect(thrown).toEqual(msg);
      done();
    });
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

    cc.go(function*() {
      var thrown = null;
      try {
        yield failing;
      } catch(ex) {
        thrown = ex;
      }
      expect(thrown).toEqual(msg);

      expect(yield succeeding).toEqual(val);

      done();
    });
  });
});
