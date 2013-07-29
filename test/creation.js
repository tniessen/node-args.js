
var Parser = require('..').Parser,
    assert = require('assert');

suite('Parser creation', function() {
  test('Switches and unflagged parameter, help/usage/name properties', function() {
    var parser = new Parser([
      { id: 'a', isSwitch: true, optionalValue: true, flags: [ 'a' ], help: 'ahelp' },
      { id: 'b', isSwitch: true, flags: [ 'b' ], help: 'bhelp', usage: 'busage' },
      { id: 'c', required: true, help: 'chelp', usage: 'cusage', name: 'cname' }
    ]);
    var params = parser.params();
    assert.strictEqual('a', params[0].id);
    assert(params[0].isSwitch);
    assert(params[0].optionalValue);
    assert.deepEqual([ 'a' ], params[0].flags);
    assert.strictEqual('ahelp', params[0].help);
    assert.strictEqual('b', params[1].id);
    assert(params[1].isSwitch);
    assert(!params[1].optionalValue);
    assert.deepEqual([ 'b' ], params[1].flags);
    assert.strictEqual('bhelp', params[1].help);
    assert.strictEqual('c', params[2].id);
    assert(!params[2].isSwitch);
    assert(!params[2].optionalValue);
    assert.strictEqual('chelp', params[2].help);
    assert.strictEqual('cusage', params[2].usage);
    assert(params[2].required);
    assert.strictEqual('cname', params[2].name);
  });
});

