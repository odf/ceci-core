var cc = require('ceci-core');

var after = function(ms, val) {
  var result = cc.defer();

  setTimeout(function() {
    result.resolve(val.split('').reverse().join(''));
  }, ms);

  return result;
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
