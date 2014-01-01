'use strict';

var extend = function(obj, other) {
  for (var p in other)
    obj[p] = other[p];
};

extend(exports, require('./src/RingBuffer'));
extend(exports, require('./src/core'));
extend(exports, require('./src/util'));


