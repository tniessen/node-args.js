
module.exports = function() {
  // As this function must be called on a Parser instance
  // "this" actually refers to the parser
  var params = this.params();
  var message = usage(params) + '\n\n' + help(params);
  return message;
};

function usage(params) {
  var usage = '';
  for(var i = 0; i < params.length; i++){
    if(i > 0) usage += ' ';
    var par = params[i];
    if(!par.required) usage += '[';
    usage += paramUsage(par);
    if(!par.required) usage += ']';
  }
  return usage;
};

function paramUsage(par){
  if(par.usage !== null)
    return par.usage;
  var usage = '';
  if(par.flags != null){
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

function help(params) {
  var help = '';
  for(var i = 0; i < params.length; i++){
    if(i > 0) help += '\n';
    var par = params[i];
    help += paramUsage(par);
    help += '\n';
    if(par.help !== null) help += '  ' + par.help + '\n';
    if(par.defaultValue !== null && !par.isSwitch) help += '  (default: ' + par.defaultValue + ')\n';
  }
  return help;
};

