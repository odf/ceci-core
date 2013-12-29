'use strict';


function RingBuffer(size) {
  this.size = size;
  this.data_start = 0;
  this.data_count = 0;
  this.data = new Array(size);
};

RingBuffer.prototype.capacity = function() {
  return this.size;
};

RingBuffer.prototype.count = function() {
  return this.data_count;
};

RingBuffer.prototype.isEmpty = function() {
  return this.data_count == 0;
};

RingBuffer.prototype.isFull = function() {
  return this.data_count == this.size;
};

RingBuffer.prototype.write = function(val) {
  var pos = (this.data_start + this.data_count) % this.size;
  this.data[pos] = val;
  if (this.data_count < this.size)
    this.data_count += 1;
  else
    this.data_start = (this.data_start + 1) % this.size;
};

RingBuffer.prototype.read = function() {
  var val = this.data[this.data_start];
  this.data_start = (this.data_start + 1) % this.size;
  this.data_count = Math.max(this.data_count - 1, 0);
  return val;
};

RingBuffer.prototype.resize = function(n) {
  var new_data = new Array(n);
  for (var i = 0; i < this.data_count; ++i)
    new_data[i % n] = this.data[(this.data_start + i) % this.size];
  this.size = n;
  this.data_start = 0;
  this.data_count = Math.min(this.data_count, this.size);
  this.data = new_data;
};


module.exports = RingBuffer;
