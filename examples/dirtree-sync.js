'use strict';

var fs   = require('fs');
var path = require('path');


var tree = function(base, name, prefix) {
  var newbase = path.resolve(base, name);

  if (fs.lstatSync(newbase).isDirectory()) {
    var tasks = fs.readdirSync(newbase).map(function(name) {
      return tree(newbase, name, prefix + '  ');
    });
    return [].concat.apply([prefix + name + '/'], tasks);
  } else {
    return [prefix + name];
  }
};


var lines = tree('.', process.argv[2].replace(/\/+$/, ''), '');
for (var i in lines)
  console.log(lines[i]);
