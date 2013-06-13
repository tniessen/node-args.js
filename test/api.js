
var Parser = require('../args.js'),
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
    assert(/[0-9]+.[0-9]+.[0-9]+/.test(Parser.VERSION));
  });
  test('Functions', function() {
    assert.equal(typeof parser.parse, 'function');
    assert.equal(typeof parser.params, 'function');
    assert.equal(typeof parser.setParameters, 'function');
    assert.equal(typeof parser.getHelp, 'function');
    assert.equal(typeof parser.help, 'function');
    assert.equal(typeof parser.getUsage, 'function');
    assert.equal(typeof parser.usage, 'function');
    assert.equal(typeof parser.getParameterUsage, 'function');
    assert.equal(typeof parser.getParameterById, 'function');
    assert.equal(typeof parser.getParameterByFlag, 'function');
  });
  test('Validators', function() {
    assert.equal(typeof Parser.validators, 'object');
    assert.equal(typeof Parser.validators.get, 'function');
    assert.equal(typeof Parser.validators.number, 'function');
    assert.equal(typeof Parser.validators.int, 'function');
    assert.equal(typeof Parser.validators.enum, 'function');
    assert.equal(typeof Parser.validators.queue, 'function');
    assert.equal(typeof Parser.validators.regexp, 'function');
    assert.equal(typeof Parser.validators.json, 'function');
  });
});

