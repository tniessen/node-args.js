/*
 * parser.js
 * =======
 * This module contains the Parser class.
 */

var argsjs = require('..'),
    validators = require('./validators');

/**
 * ### Parser(params)
 * Creates a new argument parser instance with the
 * given parameters.
 */
var Parser = function(newParams) {
  if(typeof newParams != 'undefined') {
    this.params(newParams);
  } else {
    this.params([ ]);
  }
};

function error(reason, props) {
  var err = new argsjs.ParserError(props.message, error);
  for(var key in props) {
    err[key] = props[key];
  }
  if(typeof err.reason == 'undefined') {
    err.reason = {};
    err.reason[reason] = true;
  }
  throw err;
}

/**
 * ### parser.params([newParams])
 * Gets / sets the array of recognized options of this parser
 */
Parser.prototype.params = function(newParams) {

  if(newParams && Array.isArray(newParams)) {
    this._params = [];
    for(var i = 0; i < newParams.length; i++){
      var par = {}, npar = newParams[i];
      par.id = typeof npar.id !== 'undefined' ? npar.id : String(i);
      par.name = npar.name || par.id;
      par.flagged = npar.flags != null && Array.isArray(npar.flags)
                      && npar.flags.length > 0;
      par.flags = par.flagged ? npar.flags : null;
      par.isSwitch = par.flagged && !!npar.isSwitch;
      par.optionalValue = !!(par.isSwitch && npar.optionalValue);
      par.special = !!npar.special;
      par.greedy = (!par.flagged && npar.greedy);
      par.multiple = (par.flagged && npar.multiple);
      par.defaultValue = npar.defaultValue || (par.isSwitch && !par.multiple ? false : null);
      par.help = npar.help || null;
      par.usage = npar.usage || null;
      par.required = !!npar.required;
      par.validator = validators.get(npar.validator);
      this._params.push(par);
    }
  }

  return this._params;
};

/**
 * ### parser.flags()
 * Returns all flags with associated parameters
 */
Parser.prototype.flags = function() {
  var flags = {};
  for(var i = 0; i < this._params.length; i++) {
    if(this._params[i].flagged) {
      for(var j = 0; j < this._params[i].flags.length; j++) {
        var flag = this._params[i].flags[j];
        flags[flag] = this._params[i];
      }
    }
  }
  return flags;
};

/**
 * ### parser.usage()
 * Returns a single-line string describing the
 * program usage.
 */
Parser.prototype.usage = function() {
  var usage = '';
  for(var i = 0; i < this._params.length; i++){
    if(i > 0) usage += ' ';
    var par = this._params[i];
    if(!par.required) usage += '[';
    usage += this.getParameterUsage(par);
    if(!par.required) usage += ']';
  }
  return usage;
};

/**
 * ### parser.getParameterUsage(parameter)
 * Returns the usage of the given parameter
 * including its flags and the value name.
 */
Parser.prototype.getParameterUsage = function(par){
  if(par.usage !== null)
    return par.usage;
  var usage = '';
  if(par.flagged){
    for(var j = 0; j < par.flags.length; j++){
      if(j > 0) usage += '|';
      usage += (par.flags[j].length > 1 ? '--' : '-') + par.flags[j];
    }
    if(par.isSwitch && par.optionalValue) {
      usage += '(:' + par.name + ')';
    }
    usage += ' ';
  }
  if(!par.isSwitch){
    usage += '<' + par.name + '>';
    if(par.greedy)
      usage += '...';
  }
  return usage;
};

/**
 * ### parser.help()
 * Returns a string containing all option
 * descriptions, flags and default values.
 */
Parser.prototype.help = function() {
  var help = '';
  for(var i = 0; i < this._params.length; i++){
    if(i > 0) help += '\n';
    var par = this._params[i];
    help += this.getParameterUsage(par);
    help += '\n';
    if(par.help !== null) help += '  ' + par.help + '\n';
    if(par.defaultValue !== null && !par.isSwitch) help += '  (default: ' + par.defaultValue + ')\n';
  }
  return help;
};

/**
 * ### parser.getParameterById(id)
 * This function returns the option
 * with the given identifier.
 */
Parser.prototype.getParameterById = function(id){
  for(var i = 0; i < this._params.length; i++)
    if(this._params[i].id === id)
      return this._params[i];
  return null;
};

/**
 * ### parser.parse(args, options)
 * Parses the given arguments and returns
 * an object containing the result.
 */
Parser.prototype.parse = function(args, options, callback) {

  var parser = this;

  if(Array.isArray(args)) {
    if(typeof options == 'object') {
      if(typeof callback != 'function') {
        callback = null;
      }
    } else {
      if(typeof options == 'function') {
        callback = options;
      }
      options = {};
    }
  } else {
    if(typeof args == 'object') {
      if(typeof options == 'function') {
        callback = options;
      }
      options = args;
    } else if(typeof args == 'function') {
      callback = args;
    }
    args = null;
  }

  if(args == null) {
    // Use process arguments by default
    args = options.args || process.argv.slice(2);
  }

  // Results go here
  var result = {};

  // We will need this later
  var flags = parser.flags();

  // If the track option is set the returned object
  // will contain information about the source of
  // values
  if(options.track) {
    result.$ = { source: {} };
    for(var i = 0; i < this._params.length; i++) {
      result.$.source[this._params[i].id] = { type: 'none' };
    }
  }

  // Special options will disable some checks
  var specialSet = false;

  // Index of current argument (0 <= i < args.length)
  var i = 0;
  // Number of unflagged arguments processed
  var unflaggedOptionCount = 0;

  // Returns true if there is at least one more argument
  function hasNext() {
    return i < args.length - 1;
  }

  // We will catch any errors before passing the to the optional
  // callback
  try {

    // Returns an unflagged parameter or throws if not found
    function findUnflaggedParam() {
      unflaggedOptionCount++;
      var count = 0;
      for(var i = 0; i < parser._params.length; i++){
        var param = parser._params[i];
        if(!param.flagged)
          if(param.greedy || unflaggedOptionCount == ++count)
            return param;
      }
      error('unexpectedValue', { message: 'No value expected: ' + args[i], parser: parser, index: i, value: args[i] });
    }

    // Sets an option which was read from options.index
    // (defaults to i)
    // Also adds source information if necessary and
    // checks for duplicated options
    function optionRead(param, value, lOptions) {
      lOptions = lOptions || {};
      var index = typeof lOptions.index == 'undefined' ? i : lOptions.index;
      var sourceType = lOptions.sourceType || 'user';
      var id = param.id;
      // Apply validator
      if(param.validator) {
        try {
          value = param.validator(value, {
            param: param,
            id: id,
            sourceType: sourceType,
            index: index,
            result: result,
            parser: parser,
            args: args
          });
        } catch(e) {
          if(e instanceof Error) throw e;
          else {
            error('validationError', { message: param.name + ': ' + e,
              validatorError: e, index: i, param: param,
              validator: param.validator, value: value });
          }
        }
        if(typeof value == 'undefined') return;
      }
      // Store value
      if(param.multiple || param.greedy) {
        if(typeof result[id] == 'undefined') result[id] = [ value ];
        else result[id].push(value);
      } else if(typeof result[id] != 'undefined') {
        error('duplicateOption', { message: 'Duplicate option: ' + param.name, parser: parser, param: param, index: index });
      } else {
        result[id] = value;
      }
      // Remember special options
      if(param.special) specialSet = true;
      // Add source information
      if(options.track) {
        result.$.source[id].type = sourceType;
        if(param.multiple || param.greedy) {
          if(typeof result.$.source[id].index == 'undefined')
            result.$.source[id].index = [ index ];
          else
            result.$.source[id].index.push(index);
        } else {
          result.$.source[id].index = index;
        }
      }
    }

    // Parses an unflagged parameter
    // Consumes: 1
    function parseUnflagged() {
        var value = args[i];
        var param = findUnflaggedParam();
        optionRead(param, value);
        i++;
    }

    // Returns the parameter associated with the
    // given flag. Throws if not found.
    function findParam(flag) {
      var param = flags[flag];
      if(param == null) {
        error('unknownOption', { message: 'Unknown option: ' + flag, parser: parser, index: i, flag: flag });
      }
      return param;
    }

    // Parses a flagged parameter
    // Consumes: 1/2
    function parseFlagged() {
        var arg = args[i];
        var isShortFlag = arg.charAt(1) !== '-';
        arg = arg.substring(isShortFlag ? 1 : 2);
        if(isShortFlag) {
          for(var j = 0; j < arg.length; j++) {
            var ch = arg.charAt(j);
            var param = findParam(ch);
            var isLast = j == arg.length - 1 ||
                          arg.charAt(j + 1) == '=' ||
                          arg.charAt(j + 1) == ':';
            // -fr -fr:4, -r=4
            if(isLast) {
              parseFlaggedParam(arg.substring(j));
              break;
            // -Dhello
            } else if(!param.isSwitch) {
              parseFlaggedParam(ch + '=' + arg.substring(j + 1), false);
              break;
            // -lia
            } else {
              parseFlaggedParam(ch, false);
              // We actually need to go back
              i--;
            }
          }
        // --test --dir=/home --dir /home
        } else {
          parseFlaggedParam(arg);
        }
    }

    // Parses a flagged parameter (without ^[-]*)
    // Consumes: 1/2
    function parseFlaggedParam(arg, mayConsumeNext) {
      if(typeof mayConsumeNext == 'undefined')
        mayConsumeNext = true;
      var sourceType;
      var flag, param;
      var value = null;
      var chi = arg.indexOf('=');
      if(chi == -1) chi = arg.indexOf(':');
      if(chi != -1) {
        flag = arg.substring(0, chi);
        value = arg.substring(chi + 1);
      } else {
        flag = arg;
      }
      // Find the parameter
      param = findParam(flag);
      if(param.isSwitch) {
        // Switches require some logic
        if(!param.optionalValue && value != null) {
          // Most switches do not need a value
          error('unexpectedValue', { message: 'No value expected: ' + flag + '=' + value, parser: parser, param: param, index: i, value: value });
        } else if(param.optionalValue && value == null) {
          if(param.defaultValue !== false) {
            // Others accept a value and use their default
            // if none was passed
            value = param.defaultValue;
            sourceType = 'default';
          } else {
            // This switch takes an optional value but
            // there is neither a value nor a default
            value = true;
            sourceType = 'none';
          }
        } else {
          // But the default switch value is still true
          if(value == null) value = true;
        }
      } else if(value == null) {
        // We need a value if it is not a switch
        if(hasNext() && mayConsumeNext) value = args[++i];
        else error('missingValue', { message: 'Expected value: ' + flag, parser: parser, param: param, index: i });
      }
      optionRead(param, value, { sourceType: sourceType });
      i++;
    }

    // Parses one or more options
    // Consumes: 1/2
    function next() {
      var arg = args[i];
      // Flagged option
      if(arg.indexOf('-') == 0){
        parseFlagged();
      }
      // Unflagged option
      else {
        parseUnflagged();
      }
    }

    if(args.length > 0) {
      // Parser loop
      do {
        next();
      } while(i < args.length);
    }

    // Put default values
    (function putDefaults() {
      var id;
      for(var i = 0; i < parser._params.length; i++){
        id = parser._params[i].id;
        if(typeof result[id] == 'undefined'){
          if(options.track){
            // Well, this is complicated
            var notAValue = parser._params[i].defaultValue === null
                          ||  (parser._params[i].isSwitch &&
                                (parser._params[i].optionalValue ||
                                  parser._params[i].defaultValue === false));
            if(notAValue)
              result.$.source[id].type = 'none';
            else
              result.$.source[id].type = 'default';
          }
          result[id] = parser._params[i].defaultValue;
        }
      }
    })();

    if(!specialSet){
      // Check whether all required parameters are set
      for(var i = 0; i < this._params.length; i++){
        var id = this._params[i].id;
        if(this._params[i].required && (typeof result[id] == 'undefined' || result[id] === null))
          error('missingParameter', { message: 'Missing parameter: ' + this._params[i].name, parser: this, param: this._params[i] });
      }
    }

  } catch(err) {
    if(callback) {
      callback(err);
      return this;
    } else throw err;
  }

  if(callback) {
    callback(null, result);
    return this;
  } else return result;
};

module.exports = Parser;

