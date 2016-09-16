args.js
=======
[![Build Status](https://travis-ci.org/tniessen/node-args.js.svg?branch=master)](https://travis-ci.org/tniessen/node-args.js)

**args.js** is yet another command line option parser for Node.js.


## Installation

Assuming you are using [npm](https://npmjs.org/):

    npm install args.js


## Module overview

    var argsjs      = require('args.js');             // index.js
    var Parser      = require('args.js').Parser;      // lib/parser.js
    var ParserError = require('args.js').ParserError; // lib/parser_error.js
    var validators  = require('args.js').validators;  // lib/validators/index.js


## Introduction

Let's start off with a very simple parser which expects exactly one
option. Save the following code to a file (example.js):

    // Load args.js and its Parser class
    var Parser = require('args.js').Parser;

    // Create a new parser
    var parser = new Parser([
      { id: 'file', required: true }
    ]);

    // Parse command line arguments
    var result = parser.parse();

    // Print result
    console.dir(result);

Running `node example.js test.c` prints:

    { file: 'test.c' }

You can, of course, parse any arguments, not just those passed to the
Node process:

    var result = parser.parse([ 'test.c' ]);


## Parameters

`parser.parse` tries to map all passed arguments to
defined parameters. You can set parameter definitions when creating a
parser (`new Parser([ ... ]);`) but you may also set / change
them through `parser.params([ ... ]);`.

#### Parameter type examples

|            | Flagged parameters                | Switches                                           | Unflagged parameters |
| ---------- | --------------------------------- | -------------------------------------------------- | -------------------- |
| Definition | `{ flags: [ '-o', '--output' ] }` | `{ flags: [ '-v', '--verbose' ], isSwitch: true }` | `{}`                 |
| Usage      | `--output bin`                    | `--verbose`                                        | `test.cpp`           |

#### Parameter properties

| Name          | Type                                    | Description                                                                                                                                               | Default           | Notes                              |
| ------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------- |
| id            | string                                  | Unique identifier of a parameter. Used as key in result object.                                                                                           | Parameter index   |                                    |
| name          | string                                  | Name of a parameter. Used for help and error messages.                                                                                                    | Unique identifier |                                    |
| flags         | array                                   | Array of flags of this parameter.                                                                                                                         | null              |                                    |
| isSwitch      | boolean                                 | Whether this parameter is a switch                                                                                                                        | false             | Parameter must be flagged          |
| optionalValue | boolean                                 | Whether this switch accepts optional values                                                                                                               | false             | Parameter must be a switch         |
| special       | boolean                                 | If you set this to true, `Parser.parse` will not check if all required parameters were set. This is useful for switches such as `--help` and `--version`. | false             |                                    |
| multiple      | boolean                                 | This parameter may be declared multiple times.                                                                                                            | false             | `result[id]` is an array of values |
| defaultValue  | any                                     | Default value of this parameter. `result[id]` will be set to this if no user-specified value exists.                                                      | null              |                                    |
| help          | string                                  | Help message to display for this parameter.                                                                                                               | null              |                                    |
| usage         | string                                  | Usage to display for this parameter.                                                                                                                      | null              |                                    |
| required      | boolean                                 | Whether this parameter is required. `Parser.parse` will throw an Error if any required options are missing and no special option is set.                  | false             |                                    |
| validator     | function, array, object, RegExp, string | This function can check / modify / remove parsed values mapped to this parameter.                                                                         | null              | See below: Validators              |

#### More parameter examples

The following table demonstrates some features of the parser. See above for information about parameter definition and below for details about argument notations.

| Parameter definition                                                                                                        | Example arguments                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ id: 'inputFile' }`                                                                                                       | `test.txt`                                                                                                                                   |
| `{ id: 'inputFiles', multiple: true }`                                                                                      | `test.txt summary.txt`                                                                                                                       |
| `{ id: 'outputFile', flags: [ 'o', 'output' ] }`                                                                            | `-o test.txt`, `--output test.txt`                                                                                                           |
| `{ id: 'optimization', flags: [ 'O', 'optimize' ], multiple: true }`                                                        | `--optimize functions`, `--optimize functions --optimize vars`, `-O functions -O vars`, `-Ofunctions -Ovars`, `-O=functions --optimize:vars` |
| `{ id: 'verbose', flags: [ 'v', 'verbose' ], isSwitch: true }`                                                              | `-v`, `--verbose`                                                                                                                            |
| `{ id: 'recursion', flags: [ 'r', 'recursive' ], isSwitch: true, optionalValue: true, defaultValue: -1, validator: 'int' }` | `-r`, `-r:5`, `--recursive`, `--recursive:5`                                                                                                 |


## Argument notations

args.js supports different common option notations. Flagged options and switches can have short and long flags (e.g. `-f` and `--flagged`).

| Parameter type               | Examples                                                     |
| ---------------------------- | ------------------------------------------------------------ |
| Flagged                      | `--flagged value`, `--flagged=value`, `-f value`, `-f=value` |
| Switches                     | `--switch`,  `-s`                                            |
| Switches with optional value | `--switch-ov`, `-v`, `--switch-ov=value`, `-v=value`         |
| Unflagged                    | `value`                                                      |

Wait, there is more. You can combine some options (mostly switches) into a single argument or omit the equal sign for short-flagged options:

| Notation  | What it means                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------- |
| `-rf`     | Two switches (r, f)                                                                             |
| `-rd foo` | One switch (r), one flagged option (d=foo)                                                      |
| `-rd=foo` | One switch (r), one flagged option (d=foo) **or** one switch (r), one switch with value (d=foo) |
| `-dfoo`   | One flagged option (d=foo)                                                                      |
| `-rdfoo`  | One switch (r), one flagged option (d=foo)                                                      |
| `-rfdfoo` | Two switches (r, f), one flagged option (d=foo)                                                 |

Equal signs can be replaced with colons.


## Error handling

`parser.parse` throws an error if it cannot parse the given arguments. Consider this example which will print an error message if you do not pass exactly one argument:

    var Parser = require('args.js').Parser;
    var parser = new Parser([
      { id: 'file', required: true }
    ]);
    try {
      result = parser.parse();
    } catch(err) {
      console.error('Invalid arguments: ' + err.message);
      process.exit(1);
    }

Error objects are not just messages but they also hold information and details about the error:

    try {
      parser.parse();
    } catch(err) {
      // Reason: parameter missing
      // Missing parameter: 'file'
      if(err.reason.missingParameter && err.param.id === 'file') {
        console.error('File name required');
      } else {
        console.error('Invalid arguments: ' + err.message);
      }
    }

`parser.parse` always sets `err.message`, `err.reason` and `err.parser`. Other properties, such as `err.param`, `err.value`, `err.index` and `err.flag`, depend on the error reason and might be undefined.


## Help and usage messages

args.js provides a simple way to generate help and usage messages:

    function printHelp() {
      console.log('./mytool ' + parser.usage());
      console.log(parser.help());
    }

`parser.usage` returns a single-line string containing all options in the order they were defined.  
`parser.help` returns a multi-line string containing all options with their help messages and default values.


## Option source tracking

Sometimes you might want to know whether a value was specified by the user or not. This can be achieved by setting the `track` option:

    parser.parse({ track: true });
    /* respectively */ parser.parse(args, { track: true });

This adds a property (`$.source`) to the returned object which holds information about the sources of returned values.

    var Parser = require('args.js').Parser;

    var parser = new Parser([
      { id: 'outputFile', flags: [ 'o', 'output' ], defaultValue: 'out.js' },
      { id: 'inputFiles', multiple: true, required: true }
    ]);

    console.log(parser.parse([ 'test.js' ], { track: true }));
    /*
    {
      "$": {
        "source": {
          "outputFile": {
            "type": "default"
          },
          "inputFiles": {
            "type": "user",
            "index": [ 0 ]
          }
        }
      },
      "inputFiles": [ "test.js" ], "outputFile": "out.js"
    }
    */

    console.log(parser.parse([ '-o=foo.js', 'test.js', 'static.js' ], { track: true }));
    /*
    {
      "$": {
        "source": {
          "outputFile": {
            "type": "user",
            "index": 0
          },
          "inputFiles": {
            "type": "user",
            "index": [ 1, 2 ]
          }
        }
      },
      "outputFile": "foo.js", "inputFiles": [ "test.js", "static.js" ]
    }
    */

The `type` property indicates whether this option has no
value (`'none'`), its default value (`'default'`)
or a user specified value (`'user'`). The `index`
property is the position of the argument that defined the value,
therefore it is undefined if the option was not defined by the user.

## Validators

Validators are functions that check, modify or remove passed options.
Default values are not validated (except from default values of switches
with `optionalValue` property).

#### Predefined validators

| Name    | Instantiation                                      | Description                                                                                                                            |
| ------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| number  | `argsjs.validators.number([message])`              | Expects the value to be a number and converts it to a JavaScript number                                                                |
| int     | `argsjs.validators.int([message])`                 | Expects the value to be a integer and converts it to a JavaScript number                                                               |
| enum    | `argsjs.validators.enum(values, [message])`        | Expects the value to be in `values` array.                                                                                             |
| regexp  | `argsjs.validators.regexp(regexp, [message])`      | Expects the value to match a regular expression.                                                                                       |
| json    | `argsjs.validators.json([callback], [message])`    | Expects the value to be valid JSON and returns the parsed result. Applies `callback` to the value.                                     |
| queue   | `argsjs.validators.queue(validators...)`           | Applies all validators, one after another.                                                                                             |
| range   | `argsjs.validators.range(a, b, [message])`         | Expects the value to be between a and b (inclusive)                                                                                    |
| boolean | `argsjs.validators.boolean([extended], [message])` | Expects the value to be a boolean (true/t/on/yes/y, false/f/off/no/n). Set `extended` to `false` to allow only `'true'` and `'false'`. |

There are shorthands for most of these validators:

| Name    | Shorthand example                                    |
| ------- | ---------------------------------------------------- |
| number  | `{ id: 'aNumber', validator: 'number' }`             |
| int     | `{ id: 'anInt', validator: 'int' }`                  |
| enum    | `{ id: 'aTime', validator: [ 'day', 'night' ] }`     |
| regexp  | `{ id: 'anotherTime', validator: /^(day|night)$/i }` |
| json    | `{ id: 'jsonEncoded', validator: 'json' }`           |
| boolean | `{ id: 'happy', validator: 'boolean' }`              |

You can even queue shorthands:

    { id: 'smallInt', validator: argsjs.validators.queue('int', [ 1, 2, 3 ]) }


#### Custom validators

This parameter has a small validator that only accepts 'day' and 'night':

    { id: 'time', validator: function(value) {
      if(value === 'day' || value === 'night') {
        return value;
      } else throw 'Expected "day" or "night"';
    }, flags: [ 't', 'time' ] }

Validators are just functions. They can take up to two arguments: `value` and
`data`. `data` is an object with the following properties:

- `param` the associated parameter
- `id` unique identifier of the parameter
- `sourceType` value source (compare source tracking)
- `index` argument index (compare source tracking)
- `result` result object as returned by `parser.parse`
- `parser` `argsjs.Parser` instance
- `args` arguments passed to `parser.parse`

If a validator returns no value (`undefined`) the operation will be
cancelled and the current value dropped. The parser proceeds with the
next option.

You can also use objects (including instances of classes) which have
a `validate` function:

    var Parser = require('args.js').Parser;

    var ListValidator = (function() {
      function ListValidator(sep) {
        this.sep = sep || ',';
      }
      ListValidator.prototype.validate = function(value) {
        return value.split(this.sep);
      };
      return ListValidator;
    })();

    var parser = new Parser([
      { id: 'ports', validator: new ListValidator(), flags: [ 'p', 'ports' ] }
    ]);

#### Actions

In some cases it might be useful to use validators as actions:

    { id: 'help', flags: [ 'help' ], isSwitch: true, special: true,
        validator: function(value, data) {
          console.log('./mytool ' + parser.usage());
          console.log('Options:');
          console.log(data.parser.help().replace(/(^|\n)/g, '$1    '));
          process.exit(0);
        }, help: 'Shows this message' }
