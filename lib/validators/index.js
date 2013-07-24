
module.exports.queue = require('./queue.js');
module.exports.number = require('./number.js');
module.exports.int = require('./int.js');
module.exports.enum = require('./enum.js');
module.exports.regexp = require('./regexp.js');
module.exports.json = require('./json.js');
module.exports.range = require('./range.js');
module.exports.boolean = require('./boolean.js');

module.exports.get = function(value) {
  if(value == null) {
    return null;
  }
  if(typeof value == 'function') {
    return value;
  }
  if(Array.isArray(value)) {
    return module.exports.enum(value);
  }
  if(value instanceof RegExp) {
    return module.exports.regexp(value);
  }
  if(typeof value == 'string') {
    if(value == 'number') {
      return module.exports.number();
    }
    if(value == 'int') {
      return module.exports.int();
    }
    if(value == 'json') {
      return module.exports.json();
    }
    if(value == 'boolean') {
      return module.exports.boolean();
    }
  }
  if(typeof value == 'object') {
    if(typeof value.validate == 'function') {
      return function() {
        return value.validate.apply(value, arguments);
      }
    }
  }
  return null;
};

