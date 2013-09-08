
var Parser = require('..').Parser,
    expect = require('chai').expect;

describe('Two dashes', function() {
  var parser;
  before(function() {
    parser = new Parser([
      { id: 'noCompression', flags: [ '0', 'no-compression' ], isSwitch: true },
      { id: 'latitude', required: true },
      { id: 'longitude', required: true }
    ]);
  });
  after(function() {
    parser = null;
  });
  it('should mark the end of flagged options', function() {
    var result = parser.parse([ '-0', '--', '-37', '12' ]);
    expect(result).to.deep.equal({
      noCompression: true,
      latitude: '-37',
      longitude: '12'
    });
  });
});

