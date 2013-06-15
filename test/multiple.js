
var Parser = require('..').Parser,
    assert = require('assert');

suite('Multiple occurrences', function() {
  var parser, parser2;
  setup(function() {
    var params = [
      { id: 'flaggedS', flags: [ 'fs' ] },
      { id: 'flaggedM', flags: [ 'fm' ], multiple: true },
      { id: 'unflaggedS' },
      { id: 'unflaggedM', greedy: true },
      { id: 'switchS', flags: [ 'ss' ], isSwitch: true },
      { id: 'switchM', flags: [ 'sm' ], isSwitch: true, multiple: true }
    ];
    parser = new Parser(params);
    params.splice(3, 1);
    parser2 = new Parser(params);
  });
  teardown(function() {
    parser = null;
  });
  test('Forbidden cases', function() {
    assert.throws(function() {
      parser.parse([ '--fs=foo', '--fs=bar' ]);
    }, /Duplicate/i);
    assert.throws(function() {
      parser2.parse([ 'foo', '--fs=fat', 'bar' ]);
    }, /No value expected/i);
    assert.throws(function() {
      parser.parse([ '--ss', '--sm', '--ss' ]);
    }, /Duplicate/i);
  });
  test('Multiple flagged options', function() {
    assert.deepEqual({
      flaggedS: 'foo',
      flaggedM: [ 'bar', 'tree' ],
      unflaggedS: null,
      unflaggedM: null,
      switchS: false,
      switchM: null
    }, parser.parse([ '--fm=bar', '--fm=tree', '--fs=foo' ]));
  });
  test('Multiple unflagged options', function() {
    assert.deepEqual({
      flaggedS: null,
      flaggedM: null,
      unflaggedS: 'foo',
      unflaggedM: [ 'bar', 'door' ],
      switchS: false,
      switchM: null
    }, parser.parse([ 'foo', 'bar', 'door' ]));
  });
  test('Multiple switches', function() {
    assert.deepEqual({
      flaggedS: null,
      flaggedM: null,
      unflaggedS: null,
      unflaggedM: null,
      switchS: true,
      switchM: [ true, true ]
    }, parser.parse([ '--sm', '--ss', '--sm' ]));
  });
});

