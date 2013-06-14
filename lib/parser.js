/*
 * parser.js
 * =======
 * This module contains the Parser class.
 */

var validators = require('./validators');

/**
 * ### Parser(params)
 * Creates a new argument parser instance with the
 * given parameters.
 */
var Parser = function(newParams) {
  if(typeof newParams != 'undefined') {
    this.setParameters(newParams);
  } else {
    this.setParameters([ ]);
  }
};

/**
 * ### parser.setParameters(parameters)
 * Sets and prepares the given parameters
 * as the accepted options.
 */
Parser.prototype.setParameters = function(newParams){

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
};

/**
 * ### parser.flags()
 * Returns all flags with their parameter identifiers.
 */
Parser.prototype.flags = function() {
  var flags = {};
  for(var i = 0; i < this._params.length; i++) {
    if(this._params[i].flagged) {
      for(var j = 0; j < this._params[i].flags.length; j++) {
        var flag = this._params[i].flags[j];
        flags[flag] = this._params[i].id;
      }
    }
  }
  return flags;
};

/**
 * ### parser.getUsage()
 * Returns a single-line string describing the
 * program usage.
 */
Parser.prototype.getUsage = function(){
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
 * ### parser.getHelp()
 * Returns a string containing all option
 * descriptions, flags and default values.
 */
Parser.prototype.getHelp = function(){
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
 * ### parser.getParameterByFlag(flag)
 * Searches and returns the option
 * with the given flag.
 */
Parser.prototype.getParameterByFlag = function(flag){
  for(var i = 0; i < this._params.length; i++)
    if(this._params[i].flagged)
      for(var j = 0; j < this._params[i].flags.length; j++)
        if(this._params[i].flags[j] === flag)
          return this._params[i];
  return null;
};

/**
 * ### parser.getUnflaggedParameter(n)
 * Returns the n-th unflagged option
 * or null.
 */
Parser.prototype.getUnflaggedParameter = function(n){
  var count = 0;
  for(var i = 0; i < this._params.length; i++){
    var param = this._params[i];
    if(!param.flagged)
      if(param.greedy || n == count++)
        return param;
  }
  return null;
};

/**
 * ### parser.putDefaults(result, track)
 * Sets all empty option values on the
 * given object to the default values.
 */
Parser.prototype.putDefaults = function(result, track){
  var id;
  for(var i = 0; i < this._params.length; i++){
    id = this._params[i].id;
    if(typeof result[id] == 'undefined'){
      if(track){
        // Well, this is complicated
        var notAValue = this._params[i].defaultValue === null
                      ||  (this._params[i].isSwitch &&
                            (this._params[i].optionalValue ||
                              this._params[i].defaultValue === false));
        if(notAValue)
          result.$.source[id].type = 'none';
        else
          result.$.source[id].type = 'default';
      }
      result[id] = this._params[i].defaultValue;
    }
  }
};

/**
 * ### parser.parse(args, options)
 * Parses the given arguments and returns
 * an object containing the result.
 */
Parser.prototype.parse = function(args, options) {

  var parser = this;

  if(typeof options == 'undefined') {
    if(Array.isArray(args) || typeof args != 'object') {
      options = {};
    } else {
      options = args;
      args = null;
    }
  }

  if(args == null) {
    // Use process arguments by default
    args = options.args || process.argv.slice(2);
  }

  // Results go here
  var result = {};

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
      value = param.validator(value, {
        param: param,
        id: id,
        sourceType: sourceType,
        index: index,
        result: result,
        parser: parser,
        args: args
      });
      if(typeof value == 'undefined') return;
    }
    // Store value
    if(param.multiple || param.greedy) {
      if(typeof result[id] == 'undefined') result[id] = [ value ];
      else result[id].push(value);
    } else if(typeof result[id] != 'undefined') {
      throw 'Duplicated option: ' + param.name;
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
      var param = parser.getUnflaggedParameter(unflaggedOptionCount++);
      if(param == null) throw 'No value expected: ' + value;
      optionRead(param, value);
      i++;
  }

  // Returns the parameter associated with the
  // given flag. Throws if not found.
  function findParam(flag) {
    var param = parser.getParameterByFlag(flag);
    if(param == null) throw 'Unknown option: ' + flag;
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
        throw 'No value expected: ' + flag;
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
      else throw 'Expected value: ' + flag;
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
  this.putDefaults(result, options.track);

  if(!specialSet){
    // Check whether all required parameters are set
    for(var i = 0; i < this._params.length; i++){
      var id = this._params[i].id;
      if(this._params[i].required && (typeof result[id] == 'undefined' || result[id] === null))
        throw 'Missing parameter: ' + this._params[i].name;
    }
  }

  return result;
};

/**
 * ### parser.params(newParams)
 * Returns the array of accepted options. If
 * the newParams argument was set, the given
 * options will be set.
 */
Parser.prototype.params = function(newParams){
  if(typeof newParams == 'undefined')
    return this._params;
  this.setParameters(newParams);
  return this;
};

/**
 * ### parser.usage()
 * Synonym for parser.getUsage()
 */
Parser.prototype.usage = function(){
  return this.getUsage();
};

/**
 * ### parser.help()
 * Synonym for parser.getHelp()
 */
Parser.prototype.help = function(){
  return this.getHelp();
};


module.exports = Parser;

