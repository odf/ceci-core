'use strict';

var extend = function(obj, other) {
  for (var p in other)
    obj[p] = other[p];
};

module.exports = require('./src/core');
extend(module.exports, require('./src/util'));
