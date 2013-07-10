var _ = {}

var ArrayProto = Array.prototype;

var nativeMap = ArrayProto.map;

_.map = function (obj, iterator, context) {
  result = [];
  if (nativeMap && obj.map === nativeMap) {
    result = obj.map(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      result.push(iterator.call(context, obj[i], i, obj));
    }
  } else {
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
