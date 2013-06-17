
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
  test('Parser.flags', function() {
    assert.deepEqual({
      a: parser.params()[0],
      b: parser.params()[1],
      bb: parser.params()[1],
      c: parser.params()[2],
      cc: parser.params()[2],
      ccc: parser.params()[2]
    }, parser.flags());
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

