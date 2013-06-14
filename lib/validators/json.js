
module.exports = function(callback, message) {
  if(typeof callback != 'function') {
    if(typeof message == 'function') {
      var cb = message;
      message = callback;
      callback = cb;
    } else {
      message = callback;
      callback = null;
    }
  }
  return function(value, option) {
    try {
      value = JSON.parse(value);
    } catch(err) {
      throw message || 'JSON expected';
    }
    if(callback) {
      value = callback(value);
    }
    return value;
  };
};

