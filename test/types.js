
var Parser = require('../args.js'),
    assert = require('assert');

suite('Parameter types', function() {

  suite('Switches', function() {
    var parser;
    setup(function() {
      parser = new Parser([
        { id: 'verbose', flags: [ 'v', 'verbose' ], isSwitch: true },
        { id: 'recursion', optionalValue: true, isSwitch: true, defaultValue: '0', flags: [ 'r', 'recursion' ] }
      ]);
    });
    teardown(function() {
      parser = null;
    });
    test('Not set', function() {
      assert.deepEqual({
        verbose: false,
        recursion: false
      }, parser.parse([ ]));
    });
    test('Short flagged', function() {
      assert.deepEqual({
        verbose: true,
        recursion: false
      }, parser.parse([ '-v' ]));
      assert.deepEqual({
        verbose: false,
        recursion: '0'
      }, parser.parse([ '-r' ]));
    });
    test('Long flagged', function() {
      assert.deepEqual({
        verbose: true,
        recursion: false
      }, parser.parse([ '--verbose' ]));
      assert.deepEqual({
        verbose: false,
        recursion: '0'
      }, parser.parse([ '--recursion' ]));
    });
    test('Optional value', function() {
      assert.deepEqual({
        verbose: false,
        recursion: '5'
      }, parser.parse([ '-r:5' ]));
    });
  });

  suite('Flagged parameters', function() {
    var parser;
    setup(function() {
      parser = new Parser([
        { id: 'outputFile', flags: [ 'o', 'output-file' ] }
      ]);
    });
    teardown(function() {
      parser = null;
    });
    test('Not set', function() {
      assert.deepEqual({
        outputFile: null
      }, parser.parse([ ]));
    });
    test('Short flagged', function() {
      assert.deepEqual({
        outputFile: 'foo'
      }, parser.parse([ '-o', 'foo' ]));
    });
    test('Long flagged', function() {
      assert.deepEqual({
        outputFile: 'foo'
      }, parser.parse([ '--output-file', 'foo' ]));
    });
  });

  suite('Unflagged parameters', function() {
    var parser;
    setup(function() {
      parser = new Parser([
        { id: 'inputFile' }
      ]);
    });
    teardown(function() {
      parser = null;
    });
    test('Not set', function() {
      assert.deepEqual({
        inputFile: null
      }, parser.parse([ ]));
    });
    test('Set', function() {
      assert.deepEqual({
        inputFile: 'bar'
      }, parser.parse([ 'bar' ]));
    });
  });

});

