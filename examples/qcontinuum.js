'use strict';

var Q  = require('q');
var exec = require('child_process').exec

var cc = require('../index');

cc.go(function*() {
  var result = yield Q.nfcall(exec, 'ls -l');
  console.log(result[0]);
  if (result[1])
    console.log(result[1]);
});
