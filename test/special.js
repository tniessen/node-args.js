
var Parser = require('../args.js'),
    assert = require('assert');

suite('Special parameters', function() {
  var parser;
  setup(function() {
    parser = new Parser([
      { id: 'files', required: true },
      { id: 'help', flags: [ 'h', 'help' ], special: true, isSwitch: true }
    ]);
  });
  teardown(function() {
    parser = null;
  });
  test('Skip check for required options', function() {
    assert.throws(function() {
      parser.parse([ ]);
    }, /Missing/);
    assert.doesNotThrow(function() {
      parser.parse([ '--help' ]);
    });
  });
});

