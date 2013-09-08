
var argsjs = require('..'),
    Parser = argsjs.Parser,
    expect = require('chai').expect;

describe('Source tracking', function() {
  var parser;
  before(function() {
    parser = new Parser([
      { id: 's1', flags: [ 's1' ], isSwitch: true },
      { id: 's2', flags: [ 's2' ], isSwitch: true, multiple: true },
      { id: 's3', flags: [ 's3' ], isSwitch: true, optionalValue: true },
      { id: 's4', flags: [ 's4' ], isSwitch: true, optionalValue: true, defaultValue: 'def' },
      { id: 'f1', flags: [ 'f1' ] },
      { id: 'f2', flags: [ 'f2' ], multiple: true },
      { id: 'f3', flags: [ 'f3' ], defaultValue: 'def' },
      { id: 'u1' },
      { id: 'u2', defaultValue: 'def' },
      { id: 'u3', greedy: true }
    ]);
  });
  it('should not be enabled if !options.track', function() {
    var ret = parser.parse([]);
    expect(ret).to.not.have.deep.property('$.source');
  });
  it('should be enabled if options.track', function() {
    var ret = parser.parse([], { track: true });
    expect(ret).to.have.deep.property('$.source');
  });
  it('should set type to "none" / "default" if no corresponding argument exists', function() {
    var ret = parser.parse([], { track: true });
    var src = ret.$.source;
    expect(src.s1.type).to.equal('none');
    expect(src.s2.type).to.equal('none');
    expect(src.s3.type).to.equal('none');
    // If you do not set s4, this will be "none". However, if you use
    // --s4, it will be "default". And if you use --s4:foo it will
    // be "user". Switches with optional values are tricky.
    // This behavior might change in future releases.
    expect(src.s4.type).to.equal('none');
    expect(src.f1.type).to.equal('none');
    expect(src.f2.type).to.equal('none');
    expect(src.f3.type).to.equal('default');
    expect(src.u1.type).to.equal('none');
    expect(src.u2.type).to.equal('default');
    expect(src.u3.type).to.equal('none');
  });
  it('should set type to "user" / "default" if a corresponding argument exists', function() {
    var ret = parser.parse(
      [ '--s1', '--s2', '--s3', '--s4', '--f1:foo', '--f2:bar', '--f3:baz', 'foo', 'bar', 'baz_1', 'baz_2' ],
      { track: true }
    );
    var src = ret.$.source;
    expect(src.s1.type).to.equal('user');
    expect(src.s2.type).to.equal('user');
    // Again, these are switches with optional values
    // and are therefore really tricky.
    expect(src.s3.type).to.equal('none');
    expect(src.s4.type).to.equal('default');
    expect(src.f1.type).to.equal('user');
    expect(src.f2.type).to.equal('user');
    expect(src.f3.type).to.equal('user');
    expect(src.u1.type).to.equal('user');
    expect(src.u2.type).to.equal('user');
    expect(src.u3.type).to.equal('user');
  });
  it('should track positions of options', function() {
    var ret = parser.parse(
      [ '--s1', '--s2', '--s3', '--s4', '--f1:foo', '--f2:bar', '--f3:baz', 'foo', 'bar', 'baz_1', 'baz_2' ],
      { track: true }
    );
    var src = ret.$.source;
    expect(src.s1.index).to.equal(0);
    expect(src.s2.index).to.deep.equal([ 1 ]);
    expect(src.s3.index).to.equal(2);
    expect(src.s4.index).to.equal(3);
    expect(src.f1.index).to.equal(4);
    expect(src.f2.index).to.deep.equal([ 5 ]);
    expect(src.u1.index).to.equal(7);
    expect(src.u2.index).to.equal(8);
    expect(src.u3.index).to.deep.equal([ 9, 10 ]);
  });
});

