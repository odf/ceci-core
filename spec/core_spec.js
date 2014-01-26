var cc = require('../index');

describe('a deferred', function() {
  var val = cc.defer();
  val.resolve(1);

  it('yields the value it was resolved with', function(done) {
    cc.go(function*() {
      expect(yield val).toEqual(1);
      done();
    });
  });
});
