/**
 * Shorthand alias for console.log.
 *
 * This variable is assigned a function that is bound to console.log,
 * providing a convenient shorthand for logging messages to the console.
 *
 * @type {function}
 * @memberof global
 * @private
 * @name _
 * @function
 * @param {*} args Zero or more arguments to be logged to the console.
 */
var L = console.log.bind(console);


/**
 * Shorthand alias for console.warn.
 *
 * This variable is assigned a function that is bound to console.warn,
 * providing a convenient shorthand for logging warning messages to the console.
 *
 * @type {function}
 * @memberof global
 * @private
 * @name _
 * @function
 * @param {*} args Zero or more arguments to be logged to the console as a warning.
 */
var LW = console.warn.bind(console);


/**
 * Shorthand alias for console.error.
 *
 * This variable is assigned a function that is bound to console.error,
 * providing a convenient shorthand for logging error messages to the console.
 *
 * @type {function}
 * @memberof global
 * @private
 * @name _
 * @function
 * @param {*} args Zero or more arguments to be logged
 *      to the console as an error message.
 */
var LE = console.error.bind(console);


/**
 * Logs debug messages to the console if debug mode is enabled.
 *
 * This function logs messages to the console with additional debug information,
 * including the name of the calling function, if debug mode is enabled. If debug
 * mode is disabled, it behaves the same as console.error.
 *
 * @memberof global
 * @private
 * @name _
 * @param {*} args Zero or more arguments to be logged to the console.
 */
function LE_() {
    var caller = "";
    try {
      throw new Error();
    } catch (e) {
      try {
        caller = e.stack.split('\n')[1].trim().match(/at (\S+)/)[1];
      } catch (e) {
        caller = '';
      }
    }
    LE("[DEBUG MSG " + caller + "] ", Array.prototype.slice.call(arguments));
}

