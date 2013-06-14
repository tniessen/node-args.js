
module.exports = function(message) {
  return function(value) {
    if(value.length > 0 && !isNaN(value)) {
      return +value;
    }
    throw message || 'Number expected';
  };
};

