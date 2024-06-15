/**
 * @fileoverview A set of functions and a class for defining
 * the type of data elements and adding metadata
 */

/**
 * Determines the type of the given element.
 *
 * @param {*} element The element to determine the type of.
 * @returns {string} The type of the element. Possible values are:
 * - 'null'
 * - 'boolean'
 * - 'integer'
 * - 'double'
 * - 'string'
 * - 'date'
 * - 'blob'
 * - 'array'
 * - 'object'
 * - 'none'
 * - 'undefined'
 */
function getTypeOf_(element) {
  return new DataTypeHelper(element).getType();
}


/**
 * DataTypeHelper class to determine the type of data.
 *
 * @class
 * @param {*} element The element to determine the type of.
 */
var DataTypeHelper = (function() {
  function DataTypeHelper(element) {
    this.element = element;
  }

  DataTypeHelper.prototype.getType = function() {
    var value = this.element;
    var isTypeOf = 'undefined';

    if (value === null) {
      isTypeOf = 'null';
    } else {
      switch (typeof value) {
        case 'boolean':
          isTypeOf = 'boolean';
          break;

        case 'number':
          // isTypeOf = Math.floor(value) === value ? 'integer' : 'double';
          // isTypeOf = (value % 1 === 0) ? 'integer' : 'double';
          isTypeOf = isFinite(value) && Math.abs(value % 1) < Number.EPSILON
            ? 'integer'
            : 'double';
          break;

        case 'string':
          isTypeOf = 'string';
          break;

        case 'object':
          if (value instanceof Date || typeof value.setHours === 'function') {
            isTypeOf = 'date';
          }
          else if (typeof value.getBytes === 'function') {
            isTypeOf = 'blob';
          }
          else if (Array.isArray(value)) {
            isTypeOf = 'array';
          }
          else {
            isTypeOf = 'object';
          }
          break;

        case 'undefined':
          isTypeOf = 'null';
          break;

        default:
          isTypeOf = 'undefined';
          break;
      }
    }

    return isTypeOf;
  };

  return DataTypeHelper;
})();


/**
 * Adds metadata to each element in a 2D array based on its type.
 *
 * @param {Array<Array<any>>} data An array of arrays representing
 *     the data to be inserted.
 * @returns {Array<Array<Object>>} A new array with metadata
 *     added to each element.
 */
function addMetaData_(data) {
  return data.map(function(row) {
    var result = new Array(row.length);

    for (var i = 0; i < row.length; i++) {
      var element = row[i];
      var type = getTypeOf_(element);
      var metadataElement = {
        metaType: type,
        value: element
      };

      if (element === undefined || element === null) {
        metadataElement.value = null;
      } else {
        if (type === 'blob') {
          metadataElement.value = element.getBytes();
        } else if (type === 'date') {
          metadataElement.value = dateTimeFormat(element, "yyyy-MM-dd HH:mm:ss");
        }
      }

      result[i] = metadataElement;
    }

    return result;
  });
}

