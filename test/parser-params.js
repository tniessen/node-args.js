
var argsjs = require('..'),
    Parser = argsjs.Parser,
    expect = require('chai').expect;

describe('parser.params', function() {
  var parser;
  before(function() {
    parser = new Parser([
      { id: 'foo' },
      { id: 'bar' }
    ]);
  });
  after(function() {
    parser = null;
  });
  it('should return all defined parameters', function() {
    var params = parser.params();
    expect(params).to.be.an('array')
      .and.to.have.length.of(2);
    expect(params[0]).to.be.an('object')
      .and.to.have.property('id')
      .that.equals('foo');
    expect(params[1]).to.be.an('object')
      .and.to.have.property('id')
      .that.equals('bar');
  });
  it('should replace defined parameters', function() {
    var oldParams = parser.params();
    var returnedParams = parser.params([
      { id: 'newParam' }
    ]);
    var newParams = parser.params();
    expect(returnedParams).to.deep.equal(newParams);
    expect(newParams).to.have.length.of(1);
    expect(newParams[0]).to.have.property('id')
      .that.equals('newParam');
    parser.params(oldParams);
  });
});

describe('parser.params.flags', function() {
  var parser;
  before(function() {
    parser = new Parser([
      { id: 'foo', flags: [ 'f', 'foo' ] },
      { id: 'bar' },
      { id: 'baz', flags: [ 'baz' ] }
    ]);
  });
  after(function() {
    parser = null;
  });
  it('should return all defined flags with corresponding parameters', function() {
    var flags = parser.params.flags();
    var params = parser.params();
    expect(flags).to.be.an('object')
      .and.to.have.property('f')
      .that.equals(params[0]);
    expect(flags).to.have.property('foo')
      .that.equals(params[0]);
    expect(flags).to.have.property('baz')
      .that.equals(params[2]);
    expect(flags).not.to.have.property('bar');
  });
});

describe('parser.params.assoc', function() {
  var parser;
  before(function() {
    parser = new Parser([
      { id: 'foo' },
      { id: 'bar' }
    ]);
  });
  after(function() {
    parser = null;
  });
  it('should return all defined parameters as an object', function() {
    var assocParams = parser.params.assoc();
    var params = parser.params();
    expect(assocParams).to.be.an('object');
    expect(assocParams).to.have.property('foo')
      .that.deep.equals(params[0]);
    expect(assocParams).to.have.property('bar')
      .that.deep.equals(params[1]);
  });
});

describe('parser.params.param', function() {
  var parser;
  before(function() {
    parser = new Parser([
      { id: 'foo' },
      { id: 'bar' },
      { id: 'baz' }
    ]);
  });
  after(function() {
    parser = null;
  });
  it('should return a defined parameter with the given identifier', function() {
    var params = parser.params();
    var voo = parser.params.param('voo'),
        bar = parser.params.param('bar');
    expect(voo).not.to.exist;
    expect(bar).to.exist
      .and.to.be.an('object')
      .and.to.equal(params[1])
      .and.to.have.property('id')
      .that.equals('bar');
  });
});

