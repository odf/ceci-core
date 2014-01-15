var Q = require('q');
var cc = require('ceci-core');

var after = function(ms, val) {
  var deferred = Q.defer();

  setTimeout(function() {
    deferred.resolve(val.split('').reverse().join(''));
  }, ms);

  return deferred.promise;
};

var done = false;

cc.go(function*() {
  console.log(yield after(1000, ".ereht era eW"));
  done = true;
});

cc.go(function*() {
  var x;
  for (;;) {
    x = yield after(100, "?tey ereht ew erA");
    if (done)
      break;
    else
      console.log(x);
  }
});
