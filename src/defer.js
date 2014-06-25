'use strict';


var PENDING  = 0;
var RESOLVED = 1;
var REJECTED = 2;


module.exports = function defer() {
  var _onResolve = null;
  var _onReject  = null;
  var _state     = PENDING;
  var _value     = undefined;

  function _publish() {
    if (_state == RESOLVED && _onResolve)
      _onResolve(_value);
    else if (_state == REJECTED && _onReject)
      _onReject(_value);
  };

  function _update(state, val) {
    if (isResolved())
      throw new Error('deferred is already resolved');

    _state = state;
    _value = val;
    _publish();
  };

  function then(onResolve, onReject) {
    if (_onResolve != null || _onReject != null)
      onReject(new Error('deferred has already been subscribed to'));
    else {
      _onResolve = onResolve;
      _onReject  = onReject;
      _publish();
    }
  }

  function resolve(val) {
    _update(RESOLVED, val);
  };

  function reject(cause) {
    _update(REJECTED, cause);
  };

  function isResolved() {
    return _state != PENDING;
  };

  return {
    then      : then,
    resolve   : resolve,
    reject    : reject,
    isResolved: isResolved
  };
};
