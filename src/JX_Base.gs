/**
 * @fileoverview Utility functions to define nested properties within `jdbcx` object.
 * Includes methods for defining a single property based on a dot-separated path and
 * for defining multiple properties using an array of paths.
 */

/**
 * @private
 * @name _
 */
var jdbcx = jdbcx || {};
jdbcx.methods = jdbcx.methods || {};


/**
 * Defines a nested property within the `jdbcx` object based on a dot-separated path.
 * If the property already exists, it will not be overwritten. If any part of the
 * path does not exist, it will be created as an empty object. Example:
 *
 * ```js
 * // Assuming jdbcx is an empty object:
 * jdbcx.define('config.database.host', 'localhost');
 * console.log(jdbcx.config.database.host); // Outputs: 'localhost'
 *
 * jdbcx.define('config.database.port', 3306);
 * console.log(jdbcx.config.database.port); // Outputs: 3306
 * ```
 *
 * @param {string} path The dot-separated path representing the property
 *     to be defined. For example, 'config.database.host' would define the 'host'
 *     property within the 'database' object, which in turn is within the 'config'
 *     object.
 * @param {*} [defaultValue] The default value to assign to the property if it does
 *     not already exist. If not provided, the last part of the path will be used as
 *     the default value.
 *
 * @return {*} The value of the defined property.
 */
jdbcx.define = function(path, defaultValue) {
  var parts = path.split('.');
  var target = jdbcx;

  for (var i = 0; i < parts.length - 1; i++) {
    if (!target[parts[i]]) {
      target[parts[i]] = {};
    }
    target = target[parts[i]];
  }

  var lp = parts[parts.length - 1];
  if (typeof target[lp] === 'undefined') {
    target[lp] = defaultValue !== undefined ? defaultValue: lp;
  }

  return target[lp];
};


/**
 * Defines multiple nested properties within the `jdbcx` object based on an array
 * of dot-separated paths. If any part of the path does not exist, it will be
 * created as an empty object. Example:
 *
 * ```js
 * // Assuming jdbcx is an empty object:
 * jdbcx.defines(['database.host', 'database.port'], 'config');
 * console.log(jdbcx.config.database.host); // Outputs: 'host'
 * console.log(jdbcx.config.database.port); // Outputs: 'port'
 * ```
 *
 * @param {string[]} paths An array of dot-separated paths representing the properties to
 *     be defined. For example, ['config.database.host', 'config.database.port'] would
 *     define the 'host' and 'port' properties within the 'database' object, which in turn
 *     is within the 'config' object.
 * @param {string} [basePath] An optional base path that will be prepended to each path
 *     in the `paths` array. If provided, it should be a dot-separated string.
 *
 * @throws {TypeError} If `paths` is not an array.
 */
jdbcx.defines = function(paths, basePath) {
  if (!Array.isArray(paths))
    throw new TypeError('Paths must be an array');
  basePath = basePath ? basePath + '.' : '';
  paths.forEach(function(path) {
      jdbcx.define(basePath + path);
  });
};


/**
 * Reference to the `jdbcx.define` function
 * for defining a single property.
 * @private
 * @name _
 */
var Export = jdbcx.define;


/**
 * Reference to the `jdbcx.defines` function
 * for defining multiple properties.
 * @private
 * @name _
 */
var Exports = jdbcx.defines;

