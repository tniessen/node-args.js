
var Parser = require('..').Parser,
    assert = require('assert');

suite('Double dash (--)', function() {
  var parser;
  setup(function() {
    parser = new Parser([
      { id: 'noCompression', flags: [ '0', 'no-compression' ], isSwitch: true },
      { id: 'latitude', required: true },
      { id: 'longitude', required: true }
    ]);
  });
  teardown(function() {
    parser = null;
  });
  test('Marks the end of flagged options', function() {
    assert.deepEqual({
      noCompression: true,
      latitude: '-37',
      longitude: '12'
    }, parser.parse([ '-0', '--', '-37', '12' ]));
    assert.deepEqual({
      noCompression: true,
      latitude: '-0',
      longitude: '-0'
    }, parser.parse([ '-0', '--', '-0', '-0' ]));
  });
});

