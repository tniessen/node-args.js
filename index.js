/*
 * index.js
 * ========
 * This module is a simple argument parser for
 * Node.js. It supports flagged options (-f &lt;value&gt;
 * and -f=&lt;value&gt;), unflagged options
 * (&lt;value&gt;), switches (-v) and offers an automated
 * but customizable help / usage mechanism along with
 * helpful error messages.
 */


/**
 * ### argsjs.VERSION
 * This is a string describing the args.js
 * version in format x.x.x.
 */
module.exports.VERSION = '0.2.0';

/**
 * ### argsjs.validators
 * This object holds several standard
 * validators (int, float, RegExp).
 */
module.exports.validators = require('./lib/validators');

/**
 * ### argsjs.Parser
 * Parser class (lib/parser.js)
 */
module.exports.Parser = require('./lib/parser.js');


