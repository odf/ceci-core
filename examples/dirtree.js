'use strict';

var fs   = require('fs');
var path = require('path');

var cc   = require('../lib/index');

var readdir = cc.nbind(fs.readdir);
var lstat   = cc.nbind(fs.lstat);


var join = function(items) {
  return cc.go(function*() {
    var result = [];
    for (var i in items)
      result.push(yield items[i]);
    return result;
  });
};


var tree = function(base, name, prefix) {
  var newbase = path.resolve(base, name);

  return cc.go(function*() {
    if ((yield lstat(newbase)).isDirectory()) {
      var tasks = (yield readdir(newbase)).map(function(name) {
        return tree(newbase, name, prefix + '  ');
      });
      return [].concat.apply([prefix + name + '/'], yield join(tasks));
    } else {
      return [prefix + name];
    }
  });
};


cc.go(function*() {
  var lines = yield tree('.', process.argv[2].replace(/\/+$/, ''), '');
  for (var i in lines)
    console.log(lines[i]);
}).then(null, function(ex) { console.log(ex.stack); });
