
var vr = require('./index.js');

module.exports = function(_validators) {
  var validators;
  if(!Array.isArray(_validators)) {
    validators = arguments;
  } else {
    validators = _validators;
  }
  for(var i = 0; i < validators.length; i++) {
    validators[i] = vr.get(validators[i]);
  }
  return function(value, option) {
    for(var i = 0; i < validators.length; i++) {
      value = validators[i](value, option);
    }
    return value;
  }
};

