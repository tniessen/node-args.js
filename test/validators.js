
var argsjs = require('..'),
    Parser = argsjs.Parser,
    validators = argsjs.validators,
    expect = require('chai').expect;

describe('Parameter validators', function() {
  var parser;
  before(function() {
    parser = new Parser();
  });
  after(function() {
    parser = null;
  });
  it('should be invoked by parser.parse on every value', function() {
    var invocations = {};
    parser.params([
      { id: 'foo', validator: function(value) { invocations[value] = true; }, greedy : true }
    ]);
    parser.parse([ 'bar', 'baz' ]);
    expect(invocations).to.have.property('bar');
    expect(invocations).to.have.property('baz');
  });
  it('should have access to value and parser information', function() {
    var checkFnArgs = function(value, data) {
      expect(arguments).with.length(2);
      expect(value).to.equal('bar');
      expect(data).to.have.property('parser')
        .that.equals(parser);
      expect(data).to.have.property('param')
        .with.property('id')
        .that.equals('foo');
      expect(data).to.have.property('id')
        .that.equals('foo');
      expect(data).to.have.property('sourceType')
        .that.equals('user');
      expect(data).to.have.property('index')
        .that.equals(0);
      expect(data).to.have.property('result')
        .that.is.an('object');
      expect(data).to.have.property('args')
        .that.is.an('array')
        .with.length(1);
    };
    parser.params([
      { id: 'foo', validator: checkFnArgs }
    ]);
    parser.parse([ 'bar' ]);
  });
  it('should be able to remove values from parser result', function() {
    parser.params([
      { id: 'foo',
        validator: function(value) {
          if(value.charAt(0) !== 'a') return value;
        },
        greedy: true
      }
    ]);
    var ret = parser.parse([ 'foo', 'aBar', 'baz' ]);
    expect(ret).to.have.property('foo')
      .that.is.an('array')
      .and.deep.equals([ 'foo', 'baz' ]);
  });
  it('should be able to modify values', function() {
    parser.params([
      { id: 'foo',
        validator: function(value) {
          return 'a' + value.replace(/^(.)/, function(match, c) { return c.toUpperCase(); });
        }
      }
    ]);
    var ret = parser.parse([ 'bar' ]);
    expect(ret).to.have.property('foo')
      .that.equals('aBar');
  });
  it('should be able to throw errors and stop parsing', function() {
    parser.params([
      { id: 'foo',
        validator: function(){
          throw 'Foo!';
        }
      }
    ]);
    expect(function() {
      parser.parse([ 'bar' ]);
    }).to.throw(/Foo!/);
  });
  it('may be objects with a "validate" function', function() {
    var FooBarValidator = (function() {
      var Validator = function() {};
      Validator.prototype.validate = function(value) {
        if(value !== 'foo' && value !== 'bar')
          throw 'Expected "foo" or "bar"';
        return value;
      };
      return Validator;
    })();
    parser.params([
      { id: 'foo', validator: new FooBarValidator() }
    ]);
    expect(function() {
      parser.parse([ 'baz' ]);
    }).to.throw(/foo.*bar/);
  });
});

describe('Number validator', function() {
  var parser;
  before(function() {
    parser = new Parser();
  });
  after(function() {
    parser = null;
  });
  it('should be in argsjs.validators', function() {
    expect(validators).to.have.property('number');
  });
  it('should convert values to numbers', function() {
    parser.params([
      { id: 'foo', validator: 'number' }
    ]);
    var ret = parser.parse([ '12.4' ]);
    expect(ret.foo).to.be.a('number')
      .and.to.equal(12.4);
  });
  it('should throw an error if a value cannot be converted to a number', function() {
    parser.params([
      { id: 'foo', validator: 'number' }
    ]);
    expect(function() {
      parser.parse([ 'foo5' ]);
    }).to.throw(/Number expected/);
  });
  it('should throw custom error messages', function() {
    parser.params([
      { id: 'foo', validator: validators.number('custom message') }
    ]);
    expect(function() {
      parser.parse([ 'foo5' ]);
    }).to.throw(/custom message/);
  });
});

describe('Integer validator', function() {
  var parser;
  before(function() {
    parser = new Parser();
  });
  after(function() {
    parser = null;
  });
  it('should be in argsjs.validators', function() {
    expect(validators).to.have.property('int');
  });
  it('should convert values to numbers', function() {
    parser.params([
      { id: 'foo', validator: 'int' }
    ]);
    var ret = parser.parse([ '12' ]);
    expect(ret.foo).to.be.a('number')
      .and.to.equal(12);
  });
  it('should throw an error if a value cannot be converted to an integer', function() {
    parser.params([
      { id: 'foo', validator: 'int' }
    ]);
    expect(function() {
      parser.parse([ '12.4' ]);
    }).to.throw(/Integer expected/);
  });
  it('should throw custom error messages', function() {
    parser.params([
      { id: 'foo', validator: validators.int('custom message') }
    ]);
    expect(function() {
      parser.parse([ '12.4' ]);
    }).to.throw(/custom message/);
  });
});

describe('Enum validator', function() {
  var parser;
  before(function() {
    parser = new Parser();
  });
  after(function() {
    parser = null;
  });
  it('should be in argsjs.validators', function() {
    expect(validators).to.have.property('int');
  });
  it('should allow a set of values', function() {
    parser.params([
      { id: 'foo', validator: [ 'foo', 'bar' ], greedy: true }
    ]);
    parser.parse([ 'foo', 'bar' ]);
  });
  it('should throw an error if a value is not allowed', function() {
    parser.params([
      { id: 'foo', validator: [ 'foo', 'bar' ] }
    ]);
    expect(function() {
      parser.parse([ 'baz' ]);
    }).to.throw(/Expected/);
  });
  it('should throw custom error messages', function() {
    parser.params([
      { id: 'foo', validator: validators.enum([ 'foo', 'bar' ], 'custom message') }
    ]);
    expect(function() {
      parser.parse([ 'baz' ]);
    }).to.throw(/custom message/);
  });
});

describe('RegExp validator', function() {
  var parser;
  before(function() {
    parser = new Parser();
  });
  after(function() {
    parser = null;
  });
  it('should be in argsjs.validators', function() {
    expect(validators).to.have.property('regexp');
  });
  it('should allow values matching a RegExp', function() {
    parser.params([
      { id: 'foo', validator: /b../, greedy: true }
    ]);
    parser.parse([ 'bar', 'baz' ]);
  });
  it('should throw an error if a value does not match the RegExp', function() {
    parser.params([
      { id: 'foo', validator: /b../ }
    ]);
    expect(function() {
      parser.parse([ 'foo' ]);
    }).to.throw(/Expected/);
  });
  it('should throw custom error messages', function() {
    parser.params([
      { id: 'foo', validator: validators.regexp(/b../, 'custom message') }
    ]);
    expect(function() {
      parser.parse([ 'foo' ]);
    }).to.throw(/custom message/);
  });
});

describe('JSON validator', function() {
  var parser;
  before(function() {
    parser = new Parser();
  });
  after(function() {
    parser = null;
  });
  it('should be in argsjs.validators', function() {
    expect(validators).to.have.property('json');
  });
  it('should convert values to objects', function() {
    parser.params([
      { id: 'foo', validator: 'json' }
    ]);
    var ret = parser.parse([ '{"num":5}' ]);
    expect(ret.foo).to.be.an('object')
      .with.property('num')
      .that.is.a('number')
      .and.equals(5);
  });
  it('should throw an error if a value is not valid JSON', function() {
    parser.params([
      { id: 'foo', validator: 'json' }
    ]);
    expect(function() {
      parser.parse([ '{malformed=true}' ]);
    }).to.throw(/JSON/);
  });
  it('should throw custom error messages', function() {
    parser.params([
      { id: 'foo', validator: validators.json('custom message') }
    ]);
    expect(function() {
      parser.parse([ '{malformed=true}' ]);
    }).to.throw(/custom message/);
  });
});

describe('Queue validator', function() {
  var parser;
  before(function() {
    parser = new Parser();
  });
  after(function() {
    parser = null;
  });
  it('should be in argsjs.validators', function() {
    expect(validators).to.have.property('queue');
  });
  it('should apply one or more validators on each value', function() {
    parser.params([
      { id: 'foo', validator: validators.queue('int', [ 1, 2, 3 ]) }
    ]);
    var ret = parser.parse([ '2' ]);
    expect(ret.foo).to.be.a('number')
      .that.equals(2);
    expect(function() {
      parser.parse([ '4' ]);
    }).to.throw(/Expected/);
  });
});

describe('Range validator', function() {
  var parser;
  before(function() {
    parser = new Parser();
  });
  after(function() {
    parser = null;
  });
  it('should be in argsjs.validators', function() {
    expect(validators).to.have.property('range');
  });
  it('should allow values in a specified range', function() {
    parser.params([
      { id: 'foo', validator: validators.range('a', 'f') }
    ]);
    var ret = parser.parse([ 'd' ]);
  });
  it('should throw an error if a value is not in a specified range', function() {
    parser.params([
      { id: 'foo', validator: validators.range('a', 'f') }
    ]);
    expect(function() {
      parser.parse([ 'k' ]);
    }).to.throw(/Must be between/);
  });
  it('should throw custom error messages', function() {
    parser.params([
      { id: 'foo', validator: validators.range('a', 'f', 'custom message') }
    ]);
    expect(function() {
      parser.parse([ 'k' ]);
    }).to.throw(/custom message/);
  });
});

describe('Boolean validator', function() {
  var parser;
  before(function() {
    parser = new Parser();
  });
  after(function() {
    parser = null;
  });
  it('should be in argsjs.validators', function() {
    expect(validators).to.have.property('boolean');
  });
  it('should allow booleans (true, false)', function() {
    parser.params([
      { id: 'foo', validator: 'boolean' }
    ]);
    var ret = parser.parse([ 'true' ]);
  });
  it('should allow other boolean expressions (on, off...) if extended', function() {
    parser.params([
      { id: 'foo', validator: 'boolean' }
    ]);
    var ret = parser.parse([ 'on' ]);
  });
  it('should not allow other boolean expressions if !extended', function() {
    parser.params([
      { id: 'foo', validator: validators.boolean(false) }
    ]);
    expect(function() {
      parser.parse([ 'on' ]);
    }).to.throw(/Boolean/);
  });
  it('should throw an error if a value cannot be evaluated to true/false', function() {
    parser.params([
      { id: 'foo', validator: 'boolean' }
    ]);
    expect(function() {
      parser.parse([ 'perhaps' ]);
    }).to.throw(/Boolean/);
  });
  it('should throw custom error messages', function() {
    parser.params([
      { id: 'foo', validator: validators.boolean('custom message') }
    ]);
    expect(function() {
      parser.parse([ 'perhaps' ]);
    }).to.throw(/custom message/);
  });
});

