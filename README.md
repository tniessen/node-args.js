
args.js
=======

**args.js** is another argument parser for
node.js. It supports different option types
and can suit many usual requirements.


Key features
------------
- Fast &amp; easy to use
- Pure JavaScript
- Advanced parameters
  - Flagged options (--file &lt;value&gt;)
  - Unflagged options (&lt;value&gt;)
    - Greedy options (&lt;value1&gt; &lt;value2&gt;... &lt;valueN&gt;)
  - Switches (--debug)


Usage
-----

Using args.js is simple (assuming you are using
<a href="http://npmjs.org">npm</a>). *cd* to your
project's root directory and run
<pre>npm install args.js</pre>
Afterwards, you can include the module like this:
<pre>var args = require('args.js');</pre>

API
---

### args(params)
Creates a new argument parser instance with the given parameters.

### args.version
This is a string describing the args.js version in format x.x.x.

### args.setParameters(parameters)
Sets and prepares the given parameters as the accepted options.

### args.getUsage()
Returns a single-line string describing the program usage.

### args.getParameterUsage(parameter)
Returns the usage of the given parameter including its flags and the value name.

### args.getHelp()
Returns a string containing all option descriptions, flags and default values.

### args.getParameterById(id)
This function returns the option with the given identifier.

### args.getParameterByFlag(flag)
Searches and returns the option with the given flag.

### args.getUnflaggedParameter(n)
Returns the n-th unflagged option or null.

### args.putDefaults(result)
Sets all empty option values on the given object to the default values.

### args.parse(args, trackSource)
Parses the given arguments and returns an object containing the result.

### args.params(newParams)
Returns the array of accepted options. If the newParams argument was set, the given options will be set.

### args.usage()
Synonym for args.getUsage()

### args.help()
Synonym for args.getHelp()


Changelog
---------

**0.1.0**
 - Tested &amp; stable release
 - Added *trackSource* option to *parse(args, trackSource)*

**0.0.2**
 - Removed parameter identifier transformation to allow camel case.

**0.0.1**
 - Supports flagged, unflagged, greedy options and switches
 - Automated &amp; customizable help mechanism

