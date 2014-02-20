'use strict';

var fs   = require('fs');
var path = require('path');

var cc   = require('../lib/index');


var tree = function(base, name, prefix) {
  var newbase = path.resolve(base, name);
  var subtree = function(name) { return tree(newbase, name, prefix + '  '); }

  return cc.go(function*() {
    var stat = yield cc.nbind(fs.lstat)(newbase);

    if (stat.isDirectory()) {
      var header  = prefix + name + '/';
      var entries = yield cc.nbind(fs.readdir)(newbase);
      var results = yield cc.join(entries.map(subtree));
      return [].concat.apply(header, results);
    } else {
      return [prefix + name];
    }
  });
};


var location = process.argv[2].replace(/\/+$/, '');

cc.top(cc.go(function*() {
  var results = yield tree('.', location, '');
  console.log(results.join('\n'));
}));
