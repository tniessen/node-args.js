
module.exports = function(regexp, message) {
  if(String(regexp) === regexp) {
    regexp = new RegExp(regexp);
  }
  return function(value) {
    if(regexp.test(value)) {
      return value;
    }
    throw message || 'Expected ' + regexp;
  };
};

