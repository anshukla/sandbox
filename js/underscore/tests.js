// load personal underscore library
_ = require('./underscore_ansh.js')
util = require('util')

// test each
console.log(_.each([1, 2, 3], function () { util.puts(arguments[0])} ));

// test map
console.log(_.map([1, 2, 3], function(num){ return num * 3; }));
console.log(_.map({one : 1, two : 2, three : 3}, 
  function(num, key){ 
    return num * 3; 
  }));

// test reduce
console.log(_.reduce([1, 2, 3], function(memo, num)
                     { return memo + num; }, 0));

console.log(_.reduce([0, 1, 2, 3, 4], function(previousValue, currentValue, 
                                               index, array) {
  return previousValue + currentValue;
}));

console.log(_.reduce([0, 1, 2, 3, 4], function(previousValue, currentValue, 
                                               index, array) {
  return previousValue + currentValue;
}, 10));
