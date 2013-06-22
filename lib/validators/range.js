
module.exports = function(a, b, message) {
  return function(value) {
    if(value < a || value > b) {
      throw message || 'Must be between ' + a + ' and ' + b;
    }
    return value;
  };
};

