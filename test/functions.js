
var argsjs = require('..'),
    Parser = argsjs.Parser,
    assert = require('assert');

suite('Other functions', function() {
  var parser, params;
  setup(function() {
    params = [
      { flags: [ 'a' ] },
      { flags: [ 'b', 'bb' ] },
      { flags: [ 'c', 'cc', 'ccc' ] },
    ];
    parser = new Parser(params);
  });
  teardown(function() {
    parser = params = null;
  });
  test('parser.params.flags', function() {
    assert.deepEqual({
      a: parser.params()[0],
      b: parser.params()[1],
      bb: parser.params()[1],
      c: parser.params()[2],
      cc: parser.params()[2],
      ccc: parser.params()[2]
    }, parser.params.flags());
  });
  test('parser.params.assoc', function() {
    assert.deepEqual({
      0: parser.params()[0],
      1: parser.params()[1],
      2: parser.params()[2]
    }, parser.params.assoc());
  });
  test('parser.params.param', function() {
    assert.equal(null, parser.params.param('3'));
    assert.equal(parser.params()[0], parser.params.param('0'));
  });
  test('argsjs.createParser', function() {
    var anotherParser = argsjs.createParser(params);
    assert.deepEqual(parser.params(), anotherParser.params());
  });
  test('argsjs.parse', function() {
    var args = [ '-a', 'foo', '--b', 'bar' ];
    assert.deepEqual(parser.parse(args), argsjs.parse(params, args));
  });
});

