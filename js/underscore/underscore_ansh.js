// Copied from underscore.js library
var _ = {}

// module.exports is the result of a require call
// exports = _ won't work because it doesn't change
// the underlying object. it just makes exports point to a new obj.
module.exports = _;

var ArrayProto = Array.prototype;

// clever approach stolen from underscore to save references to native functions
var nativeForEach         = ArrayProto.forEach;
var nativeMap             = ArrayProto.map;
var nativeReduce          = ArrayProto.reduce;

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
      iterator.call(context, obj[key], key, obj)
    }
  }
};

_.map = function (obj, iterator, context) {
  result = [];
  if (obj == null) return results;
  else if (nativeMap && obj.map === nativeMap) {
    result = obj.map(iterator, context);
  } 
  else {
  // better to use each because it is prewritten => save some code
    _.each(obj, function (value, key, obj) {
      result.push(iterator.call(context, value, key, obj));
    });
  }
  return result;
};

/*
 * reduce(list, function, [memo, context])
 * =======================================
 * Reduce combines a list of values into a single value. "Memo" (also known as
 * base) is the initial value and each successive step adds the value returned
 * by the iterator to the memo. By default, the memo is set to 0. The iterator
 * is called with the context and is expected to have the following signature:
 *
 * iterator(memo, value, index (key), list);
 *
 * The first time the iterator is called, memo can have one of two values: if
 * memo was defined, then that value will be passed and value will be the first
 * value in the array. Otherwise, memo will have the value of the first element
 * in the array and value will be the second array element.
 *
 * If the list is null, reduce will throw a TypeError, consistent with the
 * behavior of native reduce on null object.
 *
 * If an element of the list is undefined, it will be skipped.
*/

_.reduce = function (list, iterator, memo, context) {
  // 1. figure out the right way to iterate through everything
  //    a. Delegate that to the each method
  //    b. If the native reduce function exists, call that
  // 2. add memo to everything

  // checks are optional – would be detected automatically at some point
  // anyways. Taken from scrict mode of Firefox ECMA5 implementation.
  if (list === null || typeof list === 'undefined')
    throw new TypeError('_.reduce called on null or undefined');

  if (typeof iterator !== 'function')
    throw new TypeError(iterator + ' is not a function');

  var initial = arguments.length > 2;

  _.each(list, function(value, key, obj) {
    if (!initial) {
      memo = value;
      initial = true;
    }
    else {
      memo = iterator.call(context, memo, value, key, obj);
    }
  });
  
  return memo;
};
