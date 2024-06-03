/**
 * @fileoverview Custom error constructors.
 */

/**
 * Custom error constructor for SQL-related errors.
 * @name _
 * @param {Error} error The error object to be encapsulated as an SQLError.
 * @constructor
 */
function SQLError(error) {
  this.message = error.message;
  this.stack = error.stack;
  this.name = "SQLError";
  Error.call(this, error.message);
}

SQLError.prototype = Object.create(Error.prototype);
SQLError.prototype.constructor = SQLError;


/**
 * Custom error constructor for validation errors.
 * @name _
 * @param {string} message The error message describing the validation failure.
 * @constructor
 */
function ValidationError(message) {
  try {
    throw new Error(message);
  } catch (e) {
    this.message = e.message;
    this.stack = e.stack;
  }
  this.name = "ValidationError";
  Error.call(this, this.message);
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

