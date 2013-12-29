'use strict';


const PENDING  = 0;
const RESOLVED = 1;
const REJECTED = 2;


function Deferred() {
  this.onResolve = null;
  this.onReject  = null;
  this.state     = PENDING;
  this.value     = undefined;
};

Deferred.prototype.then = function(onResolve, onReject) {
  if (this.onResolve != null || this.onReject != null)
    onReject(new Error('deferred has already been subscribed to'));
  else {
    this.onResolve = onResolve;
    this.onReject  = onReject;
    this.publish();
  }
}

Deferred.prototype.resolve = function(val) {
  this.update(RESOLVED, val);
};

Deferred.prototype.reject = function(cause) {
  this.update(REJECTED, cause);
};

Deferred.prototype.isResolved = function() {
  return this.state != PENDING;
};

Deferred.prototype.update = function(state, val) {
  if (this.isResolved())
    throw new Error('deferred is already resolved');

  this.state = state;
  this.value = val;
  this.publish();
};

Deferred.prototype.publish = function() {
  if (this.state == RESOLVED && this.onResolve)
    this.onResolve(this.value);
  else if (this.state == REJECTED && this.onReject)
    this.onReject(this.value);
};


module.exports = Deferred;
