'use strict';

var extend = function(obj, other) {
  for (var p in other)
    obj[p] = other[p];
};

exports.RingBuffer = require('./RingBuffer');

extend(exports, require('./core'));
extend(exports, require('./util'));


