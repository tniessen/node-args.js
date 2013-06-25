
var argsjs = require('..'),
    Parser = argsjs.Parser,
    assert = require('assert');

suite('API / OOP', function() {
  var parser;
  setup(function() {
    parser = new Parser();
  });
  teardown(function() {
    parser = null;
  });
  test('instanceof', function() {
    assert(parser instanceof Parser);
  });
  test('constructor', function() {
    assert(parser.constructor == Parser);
  });
  test('Version', function() {
    assert(/[0-9]+\.[0-9]+\.[0-9]+/.test(argsjs.VERSION));
  });
  test('Functions', function() {
    assert.equal(typeof parser.parse, 'function');
    assert.equal(typeof parser.params, 'function');
    assert.equal(typeof parser.help, 'function');
    assert.equal(typeof parser.usage, 'function');
    assert.equal(typeof parser.getParameterUsage, 'function');
    assert.equal(typeof parser.getParameterById, 'function');
    assert.equal(typeof parser.flags, 'function');
  });
  test('Validators', function() {
    assert.equal(typeof argsjs.validators, 'object');
    assert.equal(typeof argsjs.validators.get, 'function');
    assert.equal(typeof argsjs.validators.number, 'function');
    assert.equal(typeof argsjs.validators.int, 'function');
    assert.equal(typeof argsjs.validators.enum, 'function');
    assert.equal(typeof argsjs.validators.queue, 'function');
    assert.equal(typeof argsjs.validators.regexp, 'function');
    assert.equal(typeof argsjs.validators.json, 'function');
  });
});

