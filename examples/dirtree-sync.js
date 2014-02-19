'use strict';

var fs   = require('fs');
var path = require('path');


var tree = function(base, name, prefix) {
  var newbase = path.resolve(base, name);
  var subtree = function(name) { return tree(newbase, name, prefix + '  '); }
  var stat    = fs.lstatSync(newbase);

  if (stat.isDirectory()) {
    var header  = prefix + name + '/';
    var entries = fs.readdirSync(newbase);
    var results = entries.map(subtree);
    return [].concat.apply(header, results);
  } else {
    return [prefix + name];
  }
};


var location = process.argv[2].replace(/\/+$/, '');
var results  = tree('.', location, ''); 
console.log(results.join('\n'));
