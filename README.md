args.js
=======

**args.js** is yet another command line option parser for Node.js.
This documentation is still incomplete but args.js is under active development. Please take a look at the unit tests for more examples.


## Installation
Assuming you are using <a href="https://npmjs.org/">npm</a>:
<pre><code>npm install args.js</code></pre>


## Module overview
<pre><code>var argsjs = require('args.js');                  // index.js
var Parser = require('args.js').Parser;           // lib/parser.js
var ParserError = require('args.js').ParserError; // lib/parser_error.js
var validators = require('args.js').validators;   // lib/validators/index.js</code></pre>


## Introduction
<p>Let's start off with a very simple parser which expects exactly one
option. Save the following code to a file (example.js):
<pre><code>// Load args.js and its Parser class
var Parser = require('args.js').Parser;

// Create a new parser
var parser = new Parser([
  { id: 'file', required: true }
]);

// Parse command line arguments
var result = parser.parse();

// Print result
console.dir(result);</code></pre>
Running <code>node example.js test.c</code> prints:
<pre><code>{ file: 'test.c' }</code></pre>
You can, of course, parse any arguments, not just those passed to the
Node process:
<pre><code>var result = parser.parse([ 'test.c' ]);</code></pre>
</p>


## Parameters
<p><code>parser.parse</code> tries to map all passed arguments to
defined parameters. You can set parameter definitions when creating a
parser (<code>new Parser([ ... ]);</code>) but you may also set / change
them through <code>parser.params([ ... ]);</code>.</p>

#### Parameter type examples
<table>
  <tr>
    <th></th>
    <th>Flagged parameters</th>
    <th>Switches</th>
    <th>Unflagged parameters</th>
  </tr>
  <tr>
    <td>Defition</td>
    <td><code>{ flags: [ '-o', '--output' ],
<br/>&nbsp;&nbsp;&nbsp;... }</code></td>
    <td><code>{ flags: [ '-v', '--verbose' ],
<br/>&nbsp;&nbsp;&nbsp;isSwitch: true, ... }</code></td>
    <td><code>{ ... }</code></td>
  </tr>
  <tr>
    <td>Usage</td>
    <td><code>--output bin</code></td>
    <td><code>--verbose</code></td>
    <td><code>test.cpp</code></td>
  </tr>
</table>

#### Parameter properties
<table>
  <tr><th>Name</th><th>Type</th><th>Description</th><th>Default</th><th>Notes</th></tr>
  <tr><td>id</td><td>string</td><td>Unique identifier of a parameter. Used as key in result object.</td><td>Position in parameter array</td><td></td></tr>
  <tr><td>name</td><td>string</td><td>Name of a parameter. Used for help and error messages.</td><td>Unique identifier</td><td></td></tr>
  <tr><td>flags</td><td>array</td><td>Array of flags of this parameter.</td><td>null</td><td></td></tr>
  <tr><td>isSwitch</td><td>boolean</td><td>Whether this parameter is a switch</td><td>false</td><td>Parameter must be flagged</td></tr>
  <tr><td>optionalValue</td><td>boolean</td><td>Whether this switch accepts optional values</td><td>false</td><td>Parameter must be a switch</td></tr>
  <tr><td>special</td><td>boolean</td><td>If you set this to true <code>Parser.parse</code> will not check if all required parameters were set. This is useful for switches such as <code>--help</code> and <code>--version</code>. These are special options that do not require other parameters to be set.</td><td>false</td><td></td></tr>
  <tr><td>greedy</td><td>boolean</td><td>Greedy parameters consume as many values as possible: <code>./index.js inputFile1 ... inputFileN</code></td><td>false</td><td>Parameter must not be flagged, <code>result[id]</code> is an array of values</td></tr>
  <tr><td>multiple</td><td>boolean</td><td>This parameter may be declared multiple times.</td><td>false</td><td>Parameter must be flagged, <code>result[id]</code> is an array of values</td></tr>
  <tr><td>defaultValue</td><td>any</td><td>Default value of this parameter. <code>result[id]</code> will be set to this if no user-specified value exists.</td><td>null</td><td></td></tr>
  <tr><td>help</td><td>string</td><td>Help message to display for this parameter.</td><td>null</td><td></td></tr>
  <tr><td>usage</td><td>string</td><td>Usage to display for this parameter.</td><td>null</td><td></td></tr>
  <tr><td>required</td><td>boolean</td><td>Whether this parameter is required. <code>Parser.parse</code> will throw an Error if any required options are missing and no special option is set.</td><td>false</td><td></td></tr>
  <tr><td>validator</td><td>function, array, object, RegExp, string</td><td>This function can check / modify / remove parsed values mapped to this parameter.</td><td>null</td><td>See below: Validators</td></tr>
</table>

#### More parameter examples
<p>The following table demonstrates some features of the parser. See above for information about parameter definition and below for details about argument notations.</p>
<table>
  <tr><th>Parameter definition</th><th>Example arguments</th></tr>
  <tr><td><code>{ id: 'inputFile' }</code></td><td><code>test.txt</code></td></tr>
  <tr><td><code>{ id: 'inputFiles', greedy: true }</code></td><td><code>test.txt summary.txt</code></td></tr>
  <tr><td><code>{ id: 'outputFile', flags: [ 'o', 'output' ] }</code></td><td><code>-o test.txt</code><br/><code>--output test.txt</code></td></tr>
  <tr><td><code>{ id: 'optimization', flags: [ 'O', 'optimize' ],<br/>multiple: true }</code></td><td><code>--optimize functions</code><br /><code>--optimize functions --optimize vars</code><br /><code>-O functions -O vars</code><br/><code>-Ofunctions -Ovars</code><br /><code>-O=functions --output:vars</code></td></tr>
  <tr><td><code>{ id: 'verbose', flags: [ 'v', 'verbose' ],<br/>isSwitch: true }</code></td><td><code>-v</code><br/><code>--verbose</code></td></tr>
  <tr><td><code>{ id: 'recursion', flags: [ 'r', 'recursive' ],<br/>isSwitch: true, optionalValue: true,<br/>defaultValue: -1, validator: 'int' }</code></td><td><code>-r</code><br/><code>-r:5</code><br/><code>--recursive</code><br/><code>--recursive:5</code></td></tr>
</table>


## Argument notations
<p>args.js supports different common option notations. Flagged options and switches can have short and long flags (e.g. <code>-f</code> and <code>--flagged</code>).</p>
<table>
  <tr><th>Parameter type</th><th>Examples</th></tr>
  <tr>
    <td>Flagged</td>
    <td>
      <code>--flagged value</code><br />
      <code>--flagged=value</code><br />
      <code>-f value</code><br />
      <code>-f=value</code>
    </td>
  </tr>
  <tr>
    <td>Switches</td>
    <td>
      <code>--switch</code><br />
      <code>-s</code>
    </td>
  </tr>
  <tr>
    <td>Switches with optional value</td>
    <td>
      <code>--switch-ov</code><br />
      <code>-v</code><br />
      <code>--switch-ov=value</code><br />
      <code>-v=value</code>
    </td>
  </tr>
  <tr>
    <td>Unflagged</td>
    <td>
      <code>value</code>
    </td>
  </tr>
</table>
<p>Wait, there is more. You can combine some options (mostly switches) into a single argument or omit the equal sign for short-flagged options:</p>
<table>
  <tr><th>Notation</th><th>What it means</th></tr>
  <tr><td><code>-rf</code></td><td>Two switches (r, f)</td></tr>
  <tr><td><code>-rd foo</code></td><td>One switch (r), one flagged option (d=foo)</td></tr>
  <tr><td><code>-rd=foo</code></td><td>One switch (r), one flagged option (d=foo)<br />or one switch (r), one switch with value (d=foo)</td></tr>
  <tr><td><code>-dfoo</code></td><td>One flagged option (d=foo)</td></tr>
  <tr><td><code>-rdfoo</code></td><td>One switch (r), one flagged option (d=foo)</td></tr>
  <tr><td><code>-rfdfoo</code></td><td>Two switches (r, f), one flagged option (d=foo)</td></tr>
</table>
<p>Equal signs can be replaced with colons.</p>


## Error handling
<p><code>parser.parse</code> throws an error if it cannot parse the given arguments. Consider this example which will print an error message if you do not pass exactly one argument:
<pre><code>var Parser = require('args.js').Parser;
var parser = new Parser([
  { id: 'file', required: true }
]);
try {
  result = parser.parse();
} catch(err) {
  console.error('Invalid arguments: ' + err.message);
  process.exit(1);
}</code></pre></p>
<p>Error objects are not just messages but they also hold information and details about the error:
<pre><code>try {
  parser.parse();
} catch(err) {
  // Reason: parameter missing
  // Missing parameter: 'file'
  if(err.reason.missingParameter && err.param.id === 'file') {
    console.error('File name required');
  } else {
    console.error('Invalid arguments: ' + err.message);
  }
}</code></pre></p>
<p><code>parser.parse</code> always sets <code>err.message</code>, <code>err.reason</code> and <code>err.parser</code>. Other properties, such as <code>err.param</code>, <code>err.value</code>, <code>err.index</code> and <code>err.flag</code>, depend on the error reason and might be undefined.</p>


## Help and usage messages
<p>args.js provides a simple way to generate help and usage messages:</p>
<pre><code>function printHelp() {
  console.log('./mytool ' + parser.usage());
  console.log(parser.help());
}
</code></pre>
<p><code>parser.usage</code> returns a single-line string containing all options in the order they were defined.<br />
<code>parser.help</code> returns a multi-line string containing all options with their help messages and default values.</p>
<p><strong>Note:</strong> This API will be replaced with a more customizable one in future releases.</p>


## Option source tracking
<p>Sometimes you might want to know whether a value was specified by the user or not. This can be achieved by setting the <code>track</code> option:</p>
<pre><code>parser.parse({ track: true });
/* respectively */ parser.parse(args, { track: true });</code></pre>
<p>This adds a property (<code>$.source</code>) to the returned object which holds information about the sources of returned values.</p>
<pre><code>var Parser = require('args.js').Parser;

var parser = new Parser([
  { id: 'outputFile', flags: [ 'o', 'output' ], defaultValue: 'out.js' },
  { id: 'inputFiles', greedy: true, required: true }
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
*/</code></pre>
<p>The <code>type</code> property indicates whether this option has no
value (<code>'none</code>), its default value (<code>'default'</code>)
or a user specified value (<code>'user'</code>). The <code>index</code>
property is the position of the argument that defined the value,
therefore it is undefined if the option was not defined by the user.</p>

## Validators
<p>Validators are functions that check, modify or remove passed options.
Default values are not validated (except from default values of switches
with <code>optionalValue</code> property).</p>

#### Predefined validators
<table>
  <tr><th>Name</th><th>Instantiation</th><th>Description</th></tr>
  <tr><td>number</td><td><code>argsjs.validators.number([message])</code></td><td>Expects value to be number and converts it to a JavaScript number</td></tr>
  <tr><td>int</td><td><code>argsjs.validators.int([message])</code></td><td>Expects value to be integer and converts it to a JavaScript number</td></tr>
  <tr><td>enum</td><td><code>argsjs.validators.enum(values, [message])</code></td><td>Expects value to be in <code>values</code> array.</td></tr>
  <tr><td>regexp</td><td><code>argsjs.validators.regexp(regexp, [message])</code></td><td>Expects value to match a regular expression</td></tr>
  <tr><td>json</td><td><code>argsjs.validators.json([callback], [message])</code></td><td>Expects value to be valid JSON and returns parsed result. Applies <code>callback</code> to the value.</td></tr>
  <tr><td>queue</td><td><code>argsjs.validators.queue(validators)<br/>argsjs.validators.queue(validator ...)</code></td><td>Applies all validators, one after another.</p></td></tr>
</table>
<p>There are shorthands for most of these validators:</p>
<table>
  <tr><th>Name</th><th>Shorthand example</th></tr>
  <tr><td>number</td><td><pre><code>{ id: 'aNumber', validator: 'number' }</pre></code></td></tr>
  <tr><td>int</td><td><pre><code>{ id: 'anInt', validator: 'int' }</pre></code></td></tr>
  <tr><td>enum</td><td><pre><code>{ id: 'aTime', validator: [ 'day', 'night' ] }</pre></code></td></tr>
  <tr><td>regexp</td><td><pre><code>{ id: 'anotherTime', validator: /^(day|night)$/i }</pre></code></td></tr>
  <tr><td>json</td><td><pre><code>{ id: 'jsonEncoded', validator: 'json' }</pre></code></td></tr>
</table>
<p>You can even queue shorthands:
<pre><code>{ id: 'smallInt', validator: argsjs.validators.queue('int', [ 1, 2, 3 ]) }</code></pre></p>

#### Custom validators
<p>This parameter has a small validator that only accepts 'day' and 'night':
<pre><code>{ id: 'time', validator: function(value) {
  if(value === 'day' || value === 'night') {
    return value;
  } else throw 'Expected "day" or "night"';
}, flags: [ 't', 'time' ] }</code></pre></p>
<p>Validators are just functions. They can take up to two arguments: <code>value</code> and
<code>data</code>. <code>data</code> is an object with the following
properties:
<ul>
  <li><code>param</code> the associated parameter</li>
  <li><code>id</code> unique identifier of the parameter</li>
  <li><code>sourceType</code> value source (compare source tracking)</li>
  <li><code>index</code> argument index (compare source tracking)</li>
  <li><code>result</code> result object as returned by <code>parser.parse</code></li>
  <li><code>parser</code> <code>argsjs.Parser</code> instance</li>
  <li><code>args</code> arguments passed to <code>parser.parse</code></li>
</ul></p>
<p>If a validator returns no value (undefined) the operation will be
cancelled and the current value dropped. The parser proceeds with the
next option.</p>
<p>You can also use objects (including instances of classes) which have
a <code>validate</code> function:
<pre><code>var Parser = require('args.js').Parser;

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
</pre></code></p>

#### Actions
<p>In some cases it might be useful to use validators as actions:
<pre><code>
{ id: 'help', flags: [ 'help' ], isSwitch: true, special: true,
    validator: function() {
      console.log('./mytool ' + parser.usage());
      console.log('Options:');
      console.log(data.parser.help().replace(/(^|\n)/g, '$1    '));
      process.exit(0);
    }, help: 'Shows this message' }
</code></pre></p>

