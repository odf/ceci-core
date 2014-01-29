'use strict';


const PENDING  = 0;
const RESOLVED = 1;
const REJECTED = 2;


function Deferred() {
  this._onResolve = null;
  this._onReject  = null;
  this._state     = PENDING;
  this._value     = undefined;
};

Deferred.prototype._update = function(state, val) {
  if (this.isResolved())
    throw new Error('deferred is already resolved');

  this._state = state;
  this._value = val;
  this._publish();
};

Deferred.prototype._publish = function() {
  if (this._state == RESOLVED && this._onResolve)
    this._onResolve(this._value);
  else if (this._state == REJECTED && this._onReject)
    this._onReject(this._value);
};


Deferred.prototype.then = function(onResolve, onReject) {
  if (this._onResolve != null || this._onReject != null)
    onReject(new Error('deferred has already been subscribed to'));
  else {
    this._onResolve = onResolve;
    this._onReject  = onReject;
    this._publish();
  }
}

Deferred.prototype.resolve = function(val) {
  this._update(RESOLVED, val);
};

Deferred.prototype.reject = function(cause) {
  this._update(REJECTED, cause);
};

Deferred.prototype.isResolved = function() {
  return this._state != PENDING;
};


module.exports = Deferred;
