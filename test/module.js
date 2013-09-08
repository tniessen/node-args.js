
var argsjs = require('..'),
    Parser = argsjs.Parser,
    expect = require('chai').expect;

describe('args.js module', function() {
  it('should contain Parser', function() {
    expect(argsjs).to.have.property('Parser');
  });
  it('should contain ParserError', function() {
    expect(argsjs).to.have.property('ParserError');
  });
  it('should contain validators', function() {
    expect(argsjs).to.have.property('validators');
  });
  it('should contain function "createParser"', function() {
    expect(argsjs).to.have.property('createParser');
  });
  it('should contain function "parse"', function() {
    expect(argsjs).to.have.property('parse');
  });
  it('should have a valid VERSION property', function() {
    expect(argsjs).to.have.property('VERSION');
    expect(argsjs.VERSION).to.match(/^[0-9]+\.[0-9]+\.[0-9]+$/);
  });
});

