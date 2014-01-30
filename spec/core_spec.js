'use strict';

var cc = require('../index');


describe('a go block', function() {
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

  it('passes out exceptions thrown in the generator', function(done) {
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
});
