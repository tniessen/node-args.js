/*
 * args.js
 * =======
 * This module is a simple argument parser for
 * Node.js. It supports flagged options (-f &lt;value&gt;
 * and -f=&lt;value&gt;), unflagged options
 * (&lt;value&gt;), switches (-v) and offers an automated
 * but customizable help / usage mechanism along with
 * helpful error messages.
 */

/**
 * ### args(params)
 * Creates a new argument parser instance with the
 * given parameters.
 */
module.exports = function(newParams){
  var params = [];

  var parser = {
    /**
     * ### args.version
     * This is a string describing the args.js
     * version in format x.x.x.
     */
    version: '0.0.2',
    /**
     * ### args.setParameters(parameters)
     * Sets and prepares the given parameters
     * as the accepted options.
     */
    setParameters: function(newParams){
      params = newParams;
      for(var i = 0; i < params.length; i++){
        params[i].id = typeof params[i].id !== 'undefined' ? params[i].id : i.toString();
        params[i].name = params[i].name || params[i].id;
        params[i].flagged = typeof params[i].flags !== 'undefined' &&
                            typeof params[i].flags.length !== 'undefined' &&
                            params[i].flags.length > 0;
        params[i].isSwitch = params[i].isSwitch || false;
        params[i].special = params[i].special || false;
        params[i].greedy = (!params[i].flagged && params[i].greedy) || false;
        params[i].multiple = (params[i].flagged && params[i].multiple) || false;
        params[i].defaultValue = params[i].defaultValue || (params[i].isSwitch ? false : null);
        params[i].help = params[i].help || null;
        params[i].usage = params[i].usage || null;
        params[i].required = params[i].required || false;
      }
    },
    /**
     * ### args.getUsage()
     * Returns a single-line string describing the
     * program usage.
     */
    getUsage: function(){
      var usage = '';
      for(var i = 0; i < params.length; i++){
        if(i > 0) usage += ' ';
        var par = params[i];
        if(!par.required) usage += '[';
        usage += parser.getParameterUsage(par);
        if(!par.required) usage += ']';
      }
      return usage;
    },
    /**
     * ### args.getParameterUsage(parameter)
     * Returns the usage of the given parameter
     * including its flags and the value name.
     */
    getParameterUsage: function(par){
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
    },
    /**
     * ### args.getHelp()
     * Returns a string containing all option
     * descriptions, flags and default values.
     */
    getHelp: function(){
      var help = '';
      for(var i = 0; i < params.length; i++){
        if(i > 0) help += '\n';
        var par = params[i];
        help += parser.getParameterUsage(par);
        help += '\n';
        if(par.help !== null) help += '  ' + par.help + '\n';
        if(par.defaultValue !== null && !par.isSwitch) help += '  (default: ' + par.defaultValue + ')\n';
      }
      return help;
    },
    /**
     * ### args.getParameterById(id)
     * This function returns the option
     * with the given identifier.
     */
    getParameterById: function(id){
      id = id.toLowerCase();
      for(var i = 0; i < params.length; i++)
        if(params[i].id === id)
          return params[i];
      return null;
    },
    /**
     * ### args.getParameterByFlag(flag)
     * Searches and returns the option
     * with the given flag.
     */
    getParameterByFlag: function(flag){
      flag = flag.toLowerCase();
      for(var i = 0; i < params.length; i++)
        if(params[i].flagged)
          for(var j = 0; j < params[i].flags.length; j++)
            if(params[i].flags[j].toLowerCase() === flag)
              return params[i];
      return null;
    },
    /**
     * ### args.getUnflaggedParameter(n)
     * Returns the n-th unflagged option
     * or null.
     */
    getUnflaggedParameter: function(n){
      var count = 0,
          param;
      for(var i = 0; i < params.length; i++){
        var param = params[i];
        if(!param.flagged)
          if(param.greedy || n == count++)
            return param;
      }
      return null;
    },
    /**
     * ### args.putDefaults(result)
     * Sets all empty option values on the
     * given object to the default values.
     */
    putDefaults: function(result){
      var id;
      for(var i = 0; i < params.length; i++){
        id = params[i].id;
        if(typeof result[id] == 'undefined')
          result[id] = params[i].defaultValue;
      }
    },
    /**
     * ### args.parse()
     * Parses the given arguments and returns
     * an object containing the result.
     */
    parse: function(args){
      if(typeof args == 'undefined')
        args = process.argv.slice(2);

      var result = {};

      // Special options will disable some checks
      var specialSet = false;

      // Iterate over all arguments
      var i = 0, param, flag, value, hasNext = args.length > 0, unflaggedOptionCount = 0;
      while(hasNext){
        if(i >= args.length)
          break;
        arg = args[i++];
        hasNext = i < args.length;
        flag = value = null;
        // Flagged option
        if(arg.indexOf('-') == 0){
          arg = arg.replace(/^-+/, '');
          if(arg.indexOf('=') != -1){
            flag = arg.substring(0, arg.indexOf('='));
            value = arg.substring(arg.indexOf('=') + 1);
          }
          else {
            flag = arg;
          }
          // Find the parameter
          param = parser.getParameterByFlag(flag);
          // Check it
          if(param == null) throw 'Unknown option: ' + flag;
          if(param.isSwitch){
            if(value != null) throw 'No value expected: ' + flag;
            else value = true;
          }
          else if(value == null){
            if(hasNext) value = args[i++];
            else throw 'Expected value: ' + flag;
          }
        }
        // Unflagged option
        else{
          value = arg;
          param = parser.getUnflaggedParameter(unflaggedOptionCount++);
          if(param == null) throw 'No value expected: ' + value;
        }
        if(param.special) specialSet = true;
        if(param.greedy || param.multiple){
          if(typeof result[param.id] == 'undefined')
            result[param.id] = [];
          result[param.id].push(value);
        }
        else{
          if(typeof result[param.id] != 'undefined')
            throw 'Duplicated parameter: ' + param.id;
          result[param.id] = value;
        }
      }

      // Put default values
      parser.putDefaults(result);

      if(!specialSet){
        // Check whether all required parameters are set
        for(var i = 0; i < params.length; i++){
          var id = params[i].id;
          if(params[i].required && (typeof result[id] == 'undefined' || result[id] === null))
            throw 'Missing parameter: ' + id;
        }
      }

      return result;
    },
    /**
     * ### args.params(newParams)
     * Returns the array of accepted options. If
     * the newParams argument was set, the given
     * options will be set.
     */
    params: function(newParams){
      if(typeof newParams == 'undefined')
        return params;
      parser.setParameters(newParams);
      return parser;
    },
    /**
     * ### args.usage()
     * Synonym for args.getUsage()
     */
    usage: function(){
      return parser.getUsage();
    },
    /**
     * ### args.help()
     * Synonym for args.getHelp()
     */
    help: function(){
      return parser.getHelp();
    }
  };

  if(typeof newParams != 'undefined')
    parser.setParameters(newParams);

  return parser;
};

