
module.exports = function(ext, message) {
  if(typeof ext == 'string') {
    message = ext;
    ext = null;
  }
  var exp;
  if(ext != null ? ext : true) {
    exp = /^((on|t|true|y|yes)|(off|f|false|n|no))$/i;
  } else {
    exp = /^((true)|(false))$/i;
  }
  return function(value) {
    var r = exp.exec(value);
    if(r) {
      return !!r[2];
    }
    throw message || 'Boolean expected';
  };
};

