// Copied from underscore.js library
var _ = {}

// module.exports is the result of a require call
// exports = _ won't work because it doesn't change
// the underlying object. it just makes exports point to a new obj.
module.exports = _;

var ArrayProto = Array.prototype;

var nativeForEach         = ArrayProto.forEach;
var nativeMap             = ArrayProto.map;

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
