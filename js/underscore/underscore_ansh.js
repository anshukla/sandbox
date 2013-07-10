// Copied from underscore.js library
var _ = {}

// module.exports is the result of a require call

var ArrayProto = Array.prototype;

var nativeForEach         = ArrayProto.forEach;

_.each = function(obj, iterator, context) {
  if (obj == null) return;
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (iterator.call(context, obj[i], i, obj) === breaker) return;
    }
  } else {
    for (var key in obj) {
      if (_.has(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) return;
      }
    }
  }
};

util = require('util')
_.each([1, 2, 3], function () { util.puts(arguments[0])} );

require('./each.js')

var nativeMap = ArrayProto.map;

_.map = function (obj, iterator, context) {
  result = [];
  if (obj == null) return results;
  else if (nativeMap && obj.map === nativeMap) {
    result = obj.map(iterator, context);
  } 
  else {
  // better to use each because it is prewritten => save some code
    for (var key in obj) {
      result.push(iterator.call(context, obj[key], key, obj));
    }
  }
  return result;
};

console.log(_.map([1, 2, 3], function(num){ return num * 3; }));
console.log(_.map({one : 1, two : 2, three : 3}, 
  function(num, key){ 
    return num * 3; 
  }));