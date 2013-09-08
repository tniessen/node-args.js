
var Parser = require('..').Parser,
    expect = require('chai').expect;

describe('Special parameters', function() {
  var parser;
  before(function() {
    parser = new Parser([
      { id: 'files', required: true },
      { id: 'help', flags: [ 'h', 'help' ], special: true, isSwitch: true }
    ]);
  });
  after(function() {
    parser = null;
  });
  it('should skip checks for required options', function() {
    expect(function() {
      parser.parse([ ]);
    }).to.throw(/Missing/);
    expect(function() {
      parser.parse([ '--help' ]);
    }).to.not.throw();
  });
});

