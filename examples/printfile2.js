'use strict';

var fs = require('fs');
var cc = require('../index');


var readLines = function(path) {
  return cc.go(function*() {
    var content = yield cc.nbind(fs.readFile, fs)(path, { encoding: 'utf8' });
    return content.split('\n');
  });
};


cc.go(function*() {
  var lines = yield readLines(process.argv[2]);

  for (var i = 1; i <= lines.length; ++i)
    console.log((i % 5 == 0 ? i : '') + '\t' + lines[i-1]);
});
