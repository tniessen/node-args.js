
var numberValidator = require('./number.js');

module.exports = function(message) {
  var sv = numberValidator(message);
  return function(value) {
    var number = sv(value);
    var i = parseInt(value);
    if(i === number) {
      return i;
    }
    throw message || 'Integer expected';
  };
};

