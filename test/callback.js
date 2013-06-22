
var Parser = require('..').Parser,
    assert = require('assert');

suite('parse() callback', function() {
  var parser;
  setup(function() {
    parser = new Parser([
      { id: 'foo', required: true }
    ]);
  });
  teardown(function() {
    parser = null;
  });
  test('On success', function() {
    var value;
    parser.parse([ 'bar'  ], function(err, v) {
      value = v;
    });
    assert.deepEqual({ foo: 'bar' }, value);
  });
  test('On error', function() {
    var error;
    parser.parse([], function(err) {
      error = err;
    });
    assert(error.reason.missingParameter);
  });
  test('Return value', function() {
    var ret = parser.parse([ 'bar' ], function(err, v) {
      // Ignore everything
    });
    assert.strictEqual(parser, ret);
  });
});

