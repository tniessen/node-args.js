
var argsjs = require('..'),
  Parser = argsjs.Parser,
  expect = require('chai').expect;

describe('Parser instances', function() {
  var parser = new Parser();
  it('should be instances of Parser', function() {
    expect(parser).to.be.an.instanceOf(Parser);
  });
  it('should have a "constructor" property', function() {
    expect(parser).to.have.property('constructor')
      .that.equals(Parser);
  });
  it('should have a "parse" function', function() {
    expect(parser).to.have.property('parse')
      .that.is.a('function');
  });
  it('should have a "help" function', function() {
    expect(parser).to.have.property('help')
      .that.is.a('function');
  });
  it('should have a "params" function', function() {
    expect(parser).to.have.property('params')
      .that.is.a('function');
  });
  it('should have a "params.flags" function', function() {
    expect(parser.params).to.have.property('flags')
      .that.is.a('function');
  });
  it('should have a "params.assoc" function', function() {
    expect(parser.params).to.have.property('assoc')
      .that.is.a('function');
  });
  it('should have a "params.param" function', function() {
    expect(parser.params).to.have.property('param')
      .that.is.a('function');
  });
});

