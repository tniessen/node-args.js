
var Parser = require('..').Parser,
    assert = require('assert');

suite('Source tracking', function() {
  var parser;
  setup(function() {
    parser = new Parser([
      { id: 'switch1', isSwitch: true, optionalValue: true, defaultValue: '0', flags: [ 's1' ] },
      { id: 'switch2', isSwitch: true, optionalValue: true, defaultValue: 'log.txt', flags: [ 's2' ] },
      { id: 'switch3', isSwitch: true, optionalValue: true, flags: [ 's3' ] },
      { id: 'switch4', isSwitch: true, flags: [ 's4' ] },
      { id: 'switch5', isSwitch: true, flags: [ 's5' ], multiple: true },
      { id: 'flagged1', flags: [ 'a' ] },
      { id: 'flagged2', flags: [ 'b' ], defaultValue: 'bdefault' },
      { id: 'flagged3', flags: [ 'c' ], multiple: true },
      { id: 'unflagged1' },
      { id: 'unflagged2', defaultValue: 'no' },
      { id: 'unflagged3', defaultValue: [ 'foo', 'bar' ], greedy: true }
    ]);
  });
  teardown(function() {
    parser = null;
  });
  function check(sources, args) {
    var result = parser.parse(args, { track: true });
    var defaults = {
      switch1: { type: 'none' },
      switch2: { type: 'none' },
      switch3: { type: 'none' },
      switch4: { type: 'none' },
      switch5: { type: 'none' },
      flagged1: { type: 'none' },
      flagged2: { type: 'default' },
      flagged3: { type: 'none' },
      unflagged1: { type: 'none' },
      unflagged2: { type: 'default' },
      unflagged3: { type: 'default' }
    };
    var actual = result.$.source,
        expected = defaults;
    for(var id in sources) {
      expected[id] = sources[id];
    }
    assert.deepEqual(expected, actual);
  }
  test('No / default values', function() {
    check({}, []);
    check({ switch1: { type: 'default', index: 0 } }, [ '--s1' ]);
    check({ switch2: { type: 'default', index: 0 } }, [ '--s2' ]);
    check({ switch3: { type: 'none', index: 0 } }, [ '--s3' ]);
  });
  test('Optional values', function() {
    check({ switch2: { type: 'user', index: 0 } }, [ '--s2:test' ]);
    check({ switch3: { type: 'user', index: 0 } }, [ '--s3:test' ]);
  });
  test('Positions', function() {
    check({ switch1: { type: 'default', index: 0 }, switch2: { type: 'user', index: 3 }, switch3: { type: 'user', index: 4 }, flagged3: { type: 'user', index: [ 2, 5 ] }, flagged1: { type: 'user', index: 7 } }, [ '--s1', '-c', 'bar', '--s2:test', '--s3:foo', '-c:bar', '-a', 'ten' ]);
  });
});

