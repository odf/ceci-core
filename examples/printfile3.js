'use strict';

var fs = require('fs');
var cc = require('../index');


var readLines = function(path, cb) {
  var result = cc.defer();

  cc.go(function*() {
    try {
      var content = yield cc.nbind(fs.readFile, fs)(path, { encoding: 'utf8' });
      result.resolve(content.split('\n'));
    } catch(err) {
      result.reject(err);
    }
  });

  return cc.nodeify(result, cb);
};


readLines(process.argv[2], function(err, val) {
  if (err)
    console.log("Oops: " + err);
  else {
    for (var i = 1; i <= val.length; ++i)
      console.log((i % 5 == 0 ? i : '') + '\t' + val[i-1]);
  }
});
