
var Parser = require('../args.js'),
    assert = require('assert');

suite('Other functions', function() {
  var parser;
  setup(function() {
    parser = new Parser([
      { flags: [ 'a' ] },
      { flags: [ 'b', 'bb' ] },
      { flags: [ 'c', 'cc', 'ccc' ] },
    ]);
  });
  teardown(function() {
    parser = null;
  });
  test('Flags', function() {
    assert.deepEqual({
      a: '0',
      b: '1',
      bb: '1',
      c: '2',
      cc: '2',
      ccc: '2'
    }, parser.flags());
  });
});

