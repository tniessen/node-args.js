
var vr = require('./index.js');

module.exports = function(_validators, message) {
  var validators;
  if(!Array.isArray(_validators)) {
    validators = arguments;
    if(validators.length > 0 &&
          typeof validators[validators.length - 1] == 'string') {
      message = validators.splice(validators.length - 1, 1);
    }
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

