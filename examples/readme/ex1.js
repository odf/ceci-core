var cc = require('ceci-core');

console.log("I am main");

cc.go(function*() {
  yield console.log("I am go block 1");
  yield console.log("I am go block 1");
});

cc.go(function*() {
  yield console.log("I am go block 2");
  yield console.log("I am go block 2");
});

console.log("I am also main");
