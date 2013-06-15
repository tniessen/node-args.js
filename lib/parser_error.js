
var util = require('util');

var ParserError = function(message, stackStartFn) {
  Error.call(this);
  this.message = message;
  Error.captureStackTrace(this, stackStartFn || this.constructor);
};

util.inherits(ParserError, Error);
ParserError.prototype.name = 'ParserError';

module.exports = ParserError;

