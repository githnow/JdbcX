/**
 * ### Description
 * Retuns date and time with specified format from any date format.
 *
 * An additional offset in relation to the project's time zone.
 *
 * ### Sample
 * ```
 * // Outputs: CURRENT_TIME_STAMP: 1713340840
 * console.log("CURRENT_TIME_STAMP:", Math.floor(new Date() / 1000));
 *
 * // Outputs: CURRENT_TIME_STAMP: 1713301200
 * console.log("CURRENT_DATE_STAMP:", Math.floor(new Date().setHours(0, 0, 0, 0) / 1000));
 *
 * // Outputs: DTF 1: 1713301200
 * console.log("DTF 1:", dateTimeFormat(CURRENT_DATE_STAMP));
 *
 * // Outputs: DTF 2: 1713340840
 * console.log("DTF 2:", dateTimeFormat());
 *
 * // Outputs: DTF 3: 1713340840
 * console.log("DTF 3:", dateTimeFormat('', '', offset=0));
 *
 * // Outputs: DTF 4: 2024-04-17 12:00:40
 * console.log("DTF 4:", dateTimeFormat(null, 'yyyy-MM-dd HH:mm:ss', offset=1));
 *
 * // Outputs: DTF 5: 2024-04-17 11:00:40
 * console.log("DTF 5:", dateTimeFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'));
 *
 * // Outputs: DTF 6: 2024-04-17 00:00:00
 * console.log("DTF 6:", dateTimeFormat(new Date(), 'yyyy-MM-dd HH:mm:ss', '', truncTime=true));
 *
 * // Outputs: DTF 7: 2024-04-17 23:59:59
 * console.log("DTF 7:", dateTimeFormat(new Date(), 'yyyy-MM-dd HH:mm:ss', '', '', greedyTime=true));
 *
 * // Outputs: DTF 8: 2022-12-30 10:11:00
 * console.log("DTF 8:", dateTimeFormat("2022-12-30 10:11", 'yyyy-MM-dd HH:mm:ss', offset=0));
 *
 * // Outputs: DTF 9: 2022-12-30 10:11:00
 * console.log("DTF 9:", dateTimeFormat("2022.12.30 10:11", 'yyyy-MM-dd HH:mm:ss', offset=0));
 *
 * // Outputs: DTF10: 2022-12-30 10:11:00
 * console.log("DTF10:", dateTimeFormat("2022/12/30 10:11", 'yyyy-MM-dd HH:mm:ss', offset=0));
 *
 * // Outputs: DTF11: 2022-12-30 00:00:00
 * console.log("DTF11:", dateTimeFormat("2022/12/30", 'yyyy-MM-dd HH:mm:ss', offset=0));
 * ```
 *
 * Return the formatted DateTime.
 *
 * @param {any} dateTime __current__:  _None or any datetime_
 * @param {string} format __current__:  _None or 'unix' for unix-timestamp_
 *     __or__:  _Date format string for stringified date_
 *     __or__:  _'date' for date format_
 *     __or__:  _'jdbc' for jdbc format_
 * @param {integer} offset __current__:  _Extra offset (hours)._
 *     Offset is added to the script's time zone.
 * @param {boolean} truncTime __current__:  _Trancated time of day to 00:00:00.000_
 * @param {boolean} greedyTime __current__:  _Extends time of day to 23:59:59.999_
 * @param {boolean} raiseOnError __current__:  _Default is false_
 * @return {integer|string} Formatted DateTime.
 */
function dateTimeFormat(dateTime, format, offset, truncTime, greedyTime, raiseOnError) {
  "use_strict";

  function stringToDate(dateTimeString) {
    var parts = dateTimeString.split(/[- : . \/]/);
    // YYYY-MM-DD
    if (parts.length === 3) { 
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    // YYYY-MM-DD HH:MM
    else if (parts.length === 5) { 
      return new Date(
        parts[0], parts[1] - 1, parts[2], parts[3], parts[4], 0
      );
    }
    // YYYY-MM-DD HH:MM:SS
    else if (parts.length === 6) { 
      return new Date(
        parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]
      );
    }
    return new Date(dateTimeString);
  }

  var ScriptTimeZone = Session.getScriptTimeZone();

  format = !format ? 'unix' : format;
  offset = !offset ? 0 : offset;
  raiseOnError = !raiseOnError ? false : raiseOnError;

  if (!dateTime) {
    dateTime = new Date();
  } else {

    // for dateTime - timestamp
    if (typeof dateTime === "number") {
      dateTime = new Date(dateTime * 1000);
    }

    // for dateTime - date
    else if (dateTime instanceof Date) {
      dateTime = new Date(dateTime);
    }

    // for dateTime - string
    else if (typeof dateTime === "string") {
      dateTime = stringToDate(dateTime);
    }
  }

  if (truncTime == true) {
    dateTime.setHours(0, 0, 0, 0);
  } else if (greedyTime == true) {
    dateTime.setHours(23, 59, 59, 999);
  }
  dateTime.setHours(dateTime.getHours() + offset);

  if (format === "unix") {
    // unix format
    dateTime = Math.floor(dateTime / 1000);
  } else if (format === "date") {
    return dateTime;
  } else if (format === "jdbc") {
    dateTime = Utilities.formatDate(dateTime, ScriptTimeZone, "yyyy-MM-dd HH:mm:ss");
    dateTime = Jdbc.parseTimestamp(dateTime);
  } else {
    try {
      dateTime = Utilities.formatDate(dateTime, ScriptTimeZone, format);
    } catch (e) {
      console.error(e.message);
      if (raiseOnError) {
        throw new Error('Wrong date time format.');
      }
    }
  }

  return dateTime;
}

/**
 * @constant {number}
 * @description Unix timestamp for the current date with the time set to 00:00:00.
 */
var CURRENT_DATE_STAMP = function() {
  // unix timestamp date
  return Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
}();

/**
 * @constant {number}
 * @description Unix timestamp for the current time.
 */
var CURRENT_TIME_STAMP = function() {
  // unix time
  return Math.floor(new Date() / 1000);
}();

