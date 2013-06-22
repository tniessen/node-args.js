
var argsjs = require('..'),
    Parser = argsjs.Parser,
    assert = require('assert');

suite('Validators', function() {
  var parser;
  setup(function() {
    parser = new Parser([
      { id: 'number', flags: [ 'n', 'number' ], validator: 'number' },
      { id: 'int', flags: [ 'i', 'int' ], validator: 'int' },
      { id: 'intrange', flags: [ 'intrange' ],
        validator: argsjs.validators.queue('int', argsjs.validators.range(1, 5)) },
      { id: 'enum', flags: [ 'e', 'enum' ], validator: [ 'sun', 'moon', 'earth' ] },
      { id: 'queue', flags: [ 'q', 'queue' ], validator: argsjs.validators.queue('int', [ 1, 2, 3 ]) },
      { id: 'regexp', flags: [ 'r', 'regexp' ], validator: /^(0x)?[0-9a-f]+$/i },
      { id: 'json', flags: [ 'j', 'json' ], validator: 'json' },
      { id: 'json2', flags: [ 'k', 'json2' ], validator: argsjs.validators.json(function(value) {
        if(typeof value.success != 'undefined') {
          throw 'Success property must not be defined';
        }
        return value;
      })},
      { id: 'custom', flags: [ 'c', 'custom' ], validator: function(value, option) {
        if(value === 'night' || value === 'dark') {
          return 'dark';
        } else if(value === 'day' || value === 'bright') {
          return 'bright';
        } else {
          throw 'Expected night or day';
        }
      }},
      { id: 'customClass', flags: [ 'l', 'customclass' ], validator: (function() {
        var SimpleValidator = function(n) {
          this.n = n;
        };
        SimpleValidator.prototype.validate = function(value, option) {
          if(option.index % this.n !== 0) {
            throw 'Invalid position';
          }
          return value;
        };
        return new SimpleValidator(2);
      })()},
      { id: 'removeInvalid', flags: [ 'z', 'remove' ], validator: function(value) {
        if(/^[0-9]+$/.test(value)) {
          return value;
        }
      }, defaultValue: '123' },
      { id: 'ignoreMe', greedy: true }
    ]);
  });
  teardown(function() {
    parser = null;
  });
  test('Number', function() {
    var value;
    assert.doesNotThrow(function() {
      value = parser.parse([ '-n=5' ]).number;
    });
    assert.deepEqual(5, value);
    assert.doesNotThrow(function() {
      value = parser.parse([ '-n=3.14' ]).number;
    });
    assert.deepEqual(3.14, value);
    assert.doesNotThrow(function() {
      value = parser.parse([ '-n=-6.28' ]).number;
    });
    assert.deepEqual(-6.28, value);
    assert.throws(function() {
      parser.parse([ '-n=5.1.2' ]);
    }, /Expected/i);
    assert.throws(function() {
      parser.parse([ '-n=foo' ]);
    }, /Expected/i);
    assert.throws(function() {
      parser.parse([ '-n=1+2' ]);
    }, /Expected/i);
  });
  test('Int', function() {
    var value;
    assert.doesNotThrow(function() {
      value = parser.parse([ '-i=5' ]).int;
    });
    assert.deepEqual(5, value);
    assert.doesNotThrow(function() {
      value = parser.parse([ '-i=-12' ]).int;
    });
    assert.deepEqual(-12, value);
    assert.throws(function() {
      parser.parse([ '-i=3.14' ]);
    }, /Expected/i);
    assert.throws(function() {
      parser.parse([ '-i=bar' ]);
    }, /Expected/i);
  });
  test('Range', function() {
    assert.doesNotThrow(function() {
      parser.parse([ '--intrange=1' ]);
    });
    assert.doesNotThrow(function() {
      parser.parse([ '--intrange=2' ]);
    });
    assert.doesNotThrow(function() {
      parser.parse([ '--intrange=5' ]);
    });
    assert.throws(function() {
      parser.parse([ '--intrange=0' ]);
    }, /Must be between/i);
    assert.throws(function() {
      parser.parse([ '--intrange=6' ]);
    }, /Must be between/i);
    assert.throws(function() {
      parser.parse([ '--intrange=20' ]);
    }, /Must be between/i);
  });
  test('Enum', function() {
    var value;
    assert.doesNotThrow(function() {
      value = parser.parse([ '-e=moon' ]).enum;
    });
    assert.deepEqual('moon', value);
    assert.doesNotThrow(function() {
      value = parser.parse([ '-e=sun' ]).enum;
    });
    assert.deepEqual('sun', value);
    assert.doesNotThrow(function() {
      value = parser.parse([ '-e=earth' ]).enum;
    });
    assert.deepEqual('earth', value);
    assert.throws(function() {
      parser.parse([ '-e=saturn' ]);
    }, /Expected/i);
    assert.throws(function() {
      parser.parse([ '-e=pluto' ]);
    }, /Expected/i);
  });
  test('Queue (int, enum)', function() {
    assert.doesNotThrow(function() {
      parser.parse([ '-q=2' ]);
    });
    assert.doesNotThrow(function() {
      parser.parse([ '-q=3' ]);
    });
    assert.throws(function() {
      parser.parse([ '-q=4' ]);
    }, /Expected/i);
  });
  test('Regular expressions', function() {
    assert.doesNotThrow(function() {
      parser.parse([ '-r=0x0123456789abcdef' ]);
    });
    assert.doesNotThrow(function() {
      parser.parse([ '-r=0a' ]);
    });
    assert.throws(function() {
      parser.parse([ '-r=0y0123456789abcdef' ]);
    }, /Expected/i);
    assert.throws(function() {
      parser.parse([ '-r=abcdefg' ]);
    }, /Expected/i);
    assert.throws(function() {
      parser.parse([ '-r=abc def' ]);
    }, /Expected/i);
  });
  test('JSON', function() {
    var value;
    assert.doesNotThrow(function() {
      value = parser.parse([ '-j={ "message": "Hello" }' ]).json;
    });
    assert.deepEqual({ message: 'Hello' }, value);
    assert.throws(function() {
      parser.parse([ '-j=notJSON' ]);
    }, /JSON/i);
    assert.throws(function() {
      parser.parse([ '-k={ "success": true }' ]);
    }, /Property/i);
  });
  test('Custom function', function() {
    var value;
    assert.doesNotThrow(function() {
      value = parser.parse([ '-c=day' ]).custom;
    });
    assert.deepEqual('bright', value);
    assert.doesNotThrow(function() {
      value = parser.parse([ '-c=dark' ]).custom;
    });
    assert.deepEqual('dark', value);
    assert.throws(function() {
      parser.parse([ '-c=midnight' ]);
    }, /Expected/i);
    assert.throws(function() {
      parser.parse([ '-c=DARK' ]);
    }, /Expected/i);
  });
  test('Custom class', function() {
    var value;
    assert.doesNotThrow(function() {
      value = parser.parse([ '-l=foo' ]).customClass;
    });
    assert.deepEqual(value, 'foo');
    assert.doesNotThrow(function() {
      value = parser.parse([ 'foo', 'foo', '-l=bar' ]).customClass;
    });
    assert.deepEqual(value, 'bar');
    assert.throws(function() {
      value = parser.parse([ 'foo', '-l=bar' ]);
    }, /Position/i);
    assert.throws(function() {
      value = parser.parse([ 'foo', 'foo', 'foo', '-l=bar' ]);
    }, /Position/i);
  });
  test('Remove option', function() {
    assert.deepEqual('123', parser.parse([ ]).removeInvalid);
    assert.deepEqual('123', parser.parse([ '-z=notANumber' ]).removeInvalid);
    assert.deepEqual('321', parser.parse([ '-z=321' ]).removeInvalid);
  });
});

