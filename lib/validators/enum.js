
module.exports = function(constants, message) {
  return function(value) {
    if(constants.indexOf(value) === -1) {
      throw message || (function() {
        var msg = 'Expected either ';
        for(var i = 0; i < constants.length; i++) {
          msg += constants[i];
          if(i == constants.length - 2) {
            msg += ' or ';
          } else if(i < constants.length - 2) {
            msg += ', ';
          }
        }
        return msg;
      })();
    }
    return value;
  };
};

