
var argsjs = require('..'),
    Parser = argsjs.Parser,
    expect = require('chai').expect;

describe('parser.parse', function() {
  var parser, parser2;
  before(function() {
    parser = new Parser([
      { id: 'foo', required: true }
    ]);
    parser2 = new Parser([
      { id: 'greedyUnflagged', required: false, multiple: true },
      { id: 'flagged', flags: [ 'f', 'flagged' ] },
      { id: 'multipleFlagged', flags: [ 'mf' ], multiple: true },
      { id: 'switch', flags: [ 's', 'switch' ], isSwitch: true },
      { id: 'multipleSwitch', flags: [ 'ms' ], multiple: true, isSwitch: true },
      { id: 'optionalValue', flags: [ 'optional-value' ], isSwitch: true, optionalValue: true },
      { id: 'flaggedDef', flags: [ 'fdef' ], defaultValue: 'defaultValue' }
    ]);
  });
  after(function() {
    parser = parser2 = null;
  });
  it('should use process.argv by default', function() {
    var oldArgv = process.argv;
    process.argv = oldArgv.slice(0, 2).concat([ 'aProcessArg' ]);
    var result = parser.parse();
    process.argv = oldArgv;
    expect(result).to.have.property('foo')
      .that.equals('aProcessArg');
  });
  it('should return the parser result', function() {
    var ret = parser.parse([ 'bar' ]);
    expect(ret).to.have.property('foo');
  });
  it('should throw errors', function() {
    expect(function() {
      parser.parse([]);
    }).to.throw(argsjs.ParserError);
  });
  it('should understand unflagged options', function() {
    var ret = parser.parse([ 'bar' ]);
    expect(ret).to.have.property('foo')
      .that.equals('bar');
  });
  it('should forbid multiple occurrences of unflagged options if !param.multiple', function() {
    expect(function() {
      parser.parse([ 'bar', 'baz' ]);
    }).to.throw();
  });
  it('should allow multiple occurrences of unflagged options if param.multiple', function() {
    expect(function() {
      var ret = parser2.parse([ 'bar', 'baz' ]);
    }).to.not.throw();
  });
  it('should understand flagged options', function() {
    var ret = parser2.parse([ '--flagged', 'foo' ]);
    expect(ret.flagged).to.equal('foo');
  });
  it('should forbid multiple occurrences of flagged options if !param.multiple', function() {
    expect(function() {
      parser2.parse([ '--flagged', 'foo', '--flagged', 'bar' ]);
    }).to.throw();
  });
  it('should allow multiple occurrences of flagged options if param.multiple', function() {
    parser2.parse([ '--mf', 'foo', '--mf', 'bar' ]);
  });
  it('should understand switches', function() {
    var ret = parser2.parse([ '--switch' ]);
    expect(ret).to.have.property('switch')
      .that.equals(true);
  });
  it('should forbid multiple occurrences of switches if !param.multiple', function() {
    expect(function() {
      parser2.parse([ '--switch', '--switch' ]);
    }).to.throw();
  });
  it('should allow multiple occurrences of switches if param.multiple', function() {
    parser2.parse([ '--ms', '--ms' ]);
  });
  it('should forbid switches with value if !param.optionalValue', function() {
    expect(function() {
      parser2.parse([ '--switch:yes' ]);
    }).to.throw();
  });
  it('should allow switches without value if param.optionalValue', function() {
    var ret;
    expect(function() {
      ret = parser2.parse([ '--optional-value' ]);
    }).to.not.throw();
    expect(ret.optionalValue).to.equal(true);
  });
  it('should allow switches with value if param.optionalValue', function() {
    var ret;
    expect(function() {
      ret = parser2.parse([ '--optional-value=yes' ]);
    }).to.not.throw();
    expect(ret.optionalValue).to.equal('yes');
  });
  it('should use an array if param.multiple', function() {
    var ret = parser2.parse([ '--ms', '--ms', 'foo', 'bar', 'baz' ]);
    expect(ret.multipleSwitch).to.be.an('array')
      .with.length(2);
    expect(ret.greedyUnflagged).to.be.an('array')
      .with.length(3);
  });
  it('should recognize all flags of a parameter', function() {
    var ret = parser2.parse([ '-s' ]);
    expect(ret.switch).to.equal(true);
    ret = parser2.parse([ '--switch' ]);
    expect(ret.switch).to.equal(true);
  });
  it('should recognize long flags as --LONG_FLAG', function() {
    var ret = parser2.parse([ '--flagged', 'bar' ]);
    expect(ret.flagged).to.equal('bar');
  });
  it('should recognize short flags as -SHORT_FLAG', function() {
    var ret = parser2.parse([ '-f', 'bar' ]);
    expect(ret.flagged).to.equal('bar');
  });
  it('should recognize multiple short flags in a single argument', function() {
    var ret = parser2.parse([ '-sf', 'bar' ]);
    expect(ret.flagged).to.equal('bar');
    expect(ret.switch).to.equal(true);
  });
  it('should recognize a value after short flags in a single argument', function() {
    var ret = parser2.parse([ '-sfbar' ]);
    expect(ret.flagged).to.equal('bar');
    expect(ret.switch).to.equal(true);
  });
  it('should recognize values after ":"', function() {
    var ret = parser2.parse([ '--flagged:foo' ]);
    expect(ret.flagged).to.equal('foo');
    ret = parser2.parse([ '-f:bar' ]);
    expect(ret.flagged).to.equal('bar');
  });
  it('should recognize values after "="', function() {
    var ret = parser2.parse([ '--flagged=foo' ]);
    expect(ret.flagged).to.equal('foo');
    ret = parser2.parse([ '-f=bar' ]);
    expect(ret.flagged).to.equal('bar');
  });
  it('should use default values if an options was not set', function() {
    var ret = parser2.parse([]);
    expect(ret.greedyUnflagged).to.equal(null);
    expect(ret.flagged).to.equal(null);
    expect(ret.multipleFlagged).to.equal(null);
    expect(ret.switch).to.equal(false);
    expect(ret.multipleSwitch).to.equal(null);
    expect(ret.optionalValue).to.equal(false);
    expect(ret.flaggedDef).to.equal('defaultValue');
  });
  it('should throw an error if a required option is missing', function() {
    var parser = new Parser([
      { id: 'foo', required: true },
      { id: 'bar', flags: [ 'bar' ], required: true }
    ]);
    expect(function() {
      parser.parse([]);
    }).to.throw(/Missing/);
    expect(function() {
      parser.parse([ 'test' ]);
    }).to.throw(/Missing .* bar/);
    expect(function() {
      parser.parse([ '--bar', '13' ]);
    }).to.throw(/Missing .* foo/);
  });
  it('should not track option sources if !options.track', function() {
    var ret = parser.parse([ 'bar' ]);
    expect(ret).to.not.have.deep.property('$.source');
  });
  it('should track option sources if options.track', function() {
    var ret = parser.parse([ 'bar' ], { track: true });
    expect(ret).to.have.deep.property('$.source');
  });
});

