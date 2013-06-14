
var Parser = require('..').Parser,
    assert = require('assert');

suite('Parameter notations', function() {
  var parser;
  setup(function() {
    parser = new Parser([
      { id: 'directory', flags: [ 'd', 'dir' ], defaultValue: '.' },
      { id: 'limit', flags: [ 'l', 'limit' ], isSwitch: true, optionalValue: true },
      { id: 'optimization', flags: [ 'O', 'optimize' ], multiple: true, defaultValue: [] }, 
      { id: 'verbose', flags: [ 'v', 'verbose' ], isSwitch: true, defaultValue: [], multiple: true }
    ]);
  });
  teardown(function() {
    parser = null;
  });
  test('No arguments', function() {
    assert.deepEqual({
      directory: '.',
      limit: false,
      optimization: [],
      verbose: []
    }, parser.parse([ ]));
  });
  test('Flagged (l) parameter (2)', function() {
    assert.deepEqual({
      directory: '/',
      limit: false,
      optimization: [],
      verbose: []
    }, parser.parse([ '--dir', '/' ]));
  });
  test('Flagged (s) parameter (2)', function() {
    assert.deepEqual({
      directory: '/',
      limit: false,
      optimization: [],
      verbose: []
    }, parser.parse([ '-d', '/' ]));
  });
  test('Flagged (l) parameter (1)', function() {
    assert.deepEqual({
      directory: '/',
      limit: false,
      optimization: [],
      verbose: []
    }, parser.parse([ '--dir:/' ]));
    assert.deepEqual({
      directory: '/',
      limit: false,
      optimization: [],
      verbose: []
    }, parser.parse([ '--dir=/' ]));
  });
  test('Flagged (s) parameter (1)', function() {
    assert.deepEqual({
      directory: '/',
      limit: false,
      optimization: [],
      verbose: []
    }, parser.parse([ '-d:/' ]));
    assert.deepEqual({
      directory: '/',
      limit: false,
      optimization: [],
      verbose: []
    }, parser.parse([ '-d=/' ]));
  });
  test('Flagged (s) parameter (1) without separator', function() {
    assert.deepEqual({
      directory: '/',
      limit: false,
      optimization: [],
      verbose: []
    }, parser.parse([ '-d/' ]));
  });
  test('Multiple occurrences of switch (s)', function() {
    assert.deepEqual({
      directory: '.',
      limit: false,
      optimization: [],
      verbose: [ true, true ]
    }, parser.parse([ '-vv' ]));
  });
  test('Multiple occurrences of switch (l)', function() {
    assert.deepEqual({
      directory: '.',
      limit: false,
      optimization: [],
      verbose: [ true, true ]
    }, parser.parse([ '--verbose', '--verbose' ]));
  });
  test('Combined syntaxes', function() {
    assert.deepEqual({
      directory: '/',
      limit: false,
      optimization: [],
      verbose: [ true, true ]
    }, parser.parse([ '-vd/', '-v' ]));
    assert.deepEqual({
      directory: '.',
      limit: true,
      optimization: [],
      verbose: []
    }, parser.parse([ '-l' ]));
    assert.deepEqual({
      directory: '/',
      limit: '10',
      optimization: [],
      verbose: []
    }, parser.parse([ '-l:10', '-d', '/' ]));
    assert.deepEqual({
      directory: '/home',
      limit: true,
      optimization: [],
      verbose: [ true ]
    }, parser.parse([ '-vld=/home' ]));
    assert.deepEqual({
      directory: '/home',
      limit: false,
      optimization: [ 'all' ],
      verbose: [ true, true ]
    }, parser.parse([ '-vvd', '/home', '-Oall' ]));
  });
});


