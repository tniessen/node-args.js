
var argsjs = require('..'),
    Parser = argsjs.Parser,
    expect = require('chai').expect;

describe('Parser constructor', function() {
  it('should be a function', function() {
    expect(Parser).to.be.a('function');
  });
  it('should accept parameter definitions', function() {
    var params = new Parser([ { id: 'foo' } ]).params.assoc();
    expect(params).to.have.property('foo');
  });
});

