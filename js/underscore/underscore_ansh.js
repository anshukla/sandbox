var _ = {}

// module.exports is the result of a require call
// exports = _ won't work because it doesn't change
// the underlying object. it just makes exports point to a new obj.
module.exports = _;

var ArrayProto = Array.prototype;
var ObjectProto = Object.prototype;

// clever approach stolen from underscore to save references to native functions
// important in JS because the references can be overwritten for some objects

var nativeForEach         = ArrayProto.forEach;
var nativeMap             = ArrayProto.map;
var nativeReduce          = ArrayProto.reduce;
var nativeSome            = ArrayProto.some;

var hasOwnProperty        = ObjectProto.hasOwnProperty;
var toString              = ObjectProto.toString;

// object that is returned if we want to break early from any loop
var breaker = {};

// copied from underscore library
_.each = function(obj, iterator, context) {
  if (obj == null) return;
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (iterator.call(context, obj[i], i, obj) === breaker) return;
    }
  } else {
    // also checks if the key is in obj, not sure why
    // perhaps for (var ...) is not as well defined
    for (var key in obj) {
      if (_.has(obj, key)){
        if (iterator.call(context, obj[key], key, obj) === breaker) return;
      }
    }
  }
};

// begin personal implementations
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

  // use this to store how to treat the first element in iteration
  var initial = arguments.length > 2;

  if (nativeReduce && nativeReduce === list.reduce) {
    // TODO(ansh) this won't work until you bind the iterator to the right
    // context. by default the iterator will be passed the list object but this
    // isn't necessarily desirable

    // even if memo is undefined, passing it will make the native reduce believe
    // that it has been defined ( TODO(ansh): check that this is true )
    return initial ? list.reduce(iterator, memo) : list.reduce(iterator);
  }
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

/* find(list, iterator, [context])
 * -------------------------------
 *  1. Look through every value on the list
 *  2. Return the first one that passes a truth test defined by iterator
 *    a. Seems like we can't just simply use each because there's no way of
 *    exiting out early from it
 *    b. Above observation is correct – this is why underscore has ability to
 *    return a breaker object to return from each early.
 *  3. Return undefined if no values pass the test
 */

_.find = function (list, iterator, context) {
  var ret;
  _.each(list, function (value) { 
    if (iterator.call(context, value)) 
      ret = value;
    return breaker; 
  }, context);
  return ret;
};

/* where(list, properties)
 * -----------------------
 *  1. Look through every value in the list
 *  2. Collect all values where object contains listen key value pairs
 *  3. Return array
 */

_.where = function (list, properties) {
  var ret = [];
  _.each(list, function (value, key, list) {
    var seen = true;
    for (var key in properties) {
      if (!_.has(value, key)) seen = false;
      else if (value[key] !== properties[key]) seen = false;
    }
    if (seen) ret.push(value);
  });
  return ret;
};

/* has(object, key)
 * ----------------
 *  Calls `object.hasOwnProperty(key)` with a stored reference in case the
 *  function has been overridden.
 */

_.has = function (object, key) {
  if (hasOwnProperty)
    return hasOwnProperty.call(object, key);
}


/* max(list, [iterator], [context])
 * --------------------------------
 *  1. Returns the maximum value (integer) in a list
 *  2. If iterator is passed, then it will return the value for which iterator
 *  returns the maximum value
 */

_.max = function (list, iterator, context) { 
  var ret = {value: -Infinity, calculated: -Infinity};
  _.each(list, function (value, key, list) {
    var calculated = !iterator ? value : iterator.call(context, value);
    calculated > ret.calculated && (ret = {value: value, calculated: calculated});
  });
  return ret.value;
}

/* groupBy(list, iterator, [context])
 * ----------------------------------
 *  1. Iterate through every element in the set
 *  2. Apply the iterator on every element
 *    a. If the iterator is a function, call iterator and the separate dpeending
 *    on the return value of the iterator on every element
 *    b. If the iterator is a string, separate based on the specified property
 */

_.groupBy = function (list, iterator, context) {
  var result = {};
  _.each (list, function (value, key, list) {
    var type = typeof iterator === "function" ? 
      iterator.call(context, value) : value[iterator];
    (_.has(result, type) ? result[type].push(value) : (result[type] = [value]));
  });
  return result;
};

/* _.isArray(obj)
 * --------------
 *  Returns true if array, false otherwise
 */
_.isArray = function (obj) {
  return toString.call(obj) === '[object Array]';
}

/* flatten(array, [shallow])
 * -------------------------
 *  1. Traverse through nested array
 *  2. Flatten it
 *  3. If shallow passed, only do it for the first level
 *
 *  One approach is to do this recurisvely? Array functions that might help:
 *  .concat .push. Array addition in Javascript is the same as pushing the
 *  second array
 *
 *  TODO(ansh): Nested ternary is ugh-laaay.
 */

_.flatten = function (array, shallow) {
  var flat = [];
  for (var i = 0, l = array.length; i < l; i++) {
      flat = flat.concat(
              _.isArray(array[i]) ?
              (shallow ? array[i] : _.flatten(array[i], false))
              : [array[i]]);
  }
  return flat;
};

/* intersection(*arrays)
 * ---------------------
 *  Computes the list of values that are the intersection of all the arrays.
 *  Each value in return array is present in all arrays.
 */

_.intersection = function (arrays) {
  var result = [];
  var freq = {};
  for (var i = 0, l = arguments.length; i < l; i++) {
    var arr = arguments[i];
    _.each(arr, function(value) {
      freq[value] = freq[value] ? freq[value] + 1 : 1;
    });
  }
  
  // Don't call each here because some key might have name 'length' which
  // would mess up implementation of each
  
  console.log(freq);
  for (var key in freq) {
    freq[key] > 1 && result.push(key);
  }
  return result;
}

