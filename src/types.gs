/**
 * @typedef {Object} JX_Config
 * @property {string} server The server address. Do not include `https://`.
 * @property {number} port The server port. MySQL 3306, SQL Server 1433.
 * @property {string} db The default database to connect to.
 * @property {string} prefix The prefix for the connection URL.
 *     (e.g. 'jdbc:mysql://', 'jdbc:google:mysql://', or 'jdbc:sqlserver://'.)
 * @property {string} userName The username to pass to the database.
 * @property {string} password The user's password.
 * @property {boolean=} [showTime] Optional flag to show execution time.
 *     Default: `true`.
 * @property {boolean=} [showLogs] Optional flag to show logs. Default: `false`.
 * @property {boolean=} [muteSQLExceptions] Optional flag to mute SQL exceptions.
 *     Default: `false`.
 * @property {string=} [project_id] Optional Google Cloud project ID.
 * @property {string=} [region] Optional Google Cloud region.
 * @property {string=} [instance] Optional Google Cloud instance.
 */

/**
 * @see insertArrayToDBTable
 * @typedef {Object} insertOptions
 * @property {string} db The name of the database. If not provided, the default
 *     database is used.
 * @property {boolean} updateDupls Flag indicating whether to update duplicates.
 *     Defaults to `false`.
 * @property {boolean} updateDuplicates Flag indicating whether to update duplicates.
 *     Defaults to `false`.
 * @property {boolean} autoCommit Flag indicating whether to auto-commit
 *     the transaction. Defaults to `false`.
 * @property {number} batchSize A positive integer, when autoCommit is enabled,
 *     determines the number of records that will be grouped and sent to
 *     in a single batch operation. The default value is `100`.
 * @property {boolean} detectTypes A boolean indicating whether to automatically
 *     detect the data types in the array and use them for the insert operation.
 *
 *     If set to `true`, the library will analyze the data being inserted
 *     and determine the appropriate data types for each column.
 *
 *     If detectTypes is set to `false`, all data will be treated as strings,
 *     regardless of the `stringTypes` option.
 *
 *     Enable it if you use date values in the date format, blob objects,
 *     boolean values, or if you need strict compliance with data types.
 *     Defaults to `true`.
 * @property {Array<string>} stringTypes An array of data types that should
 *     be treated as strings (e.g., `integer`, `double`, `object`, `array`,
 *     `boolean`) when the `detectTypes` option is enabled.
 */

/**
 * @see generateQuery
 * @see retrieveDataFromDB
 * @see getRowCountByFilter
 * @typedef {Object} queryFilter
 *
 * @property {string} filter.column
 *    The name of the column to filter on.
 * @property {string|number} filter.value
 *    The value to match in the specified column (WHERE '=').
 *
 *    __Note__: _Matching and Values properties are mutually exclusive._
 *
 * @property {string|number} filter.value_from
 *    The starting value for range-based filtering (WHERE '>').
 * @property {string|number} filter.value_to
 *    The ending value for range-based filtering (WHERE '<').
 * @property {boolean} filter.toUnixTime
 *    Indicates whether to convert the dates of the filter values
 *    to a timestamp (UNIX format).
 *
 * @property {string} filter.like
 *    Matching. The value to match using LIKE %...%.
 * @property {string} filter.notlike
 *    Matching. The value to exclude using NOT LIKE.
 * @property {string} filter.regex
 *    Matching. The regular expression to match REGEXP.
 *
 * @property {string} filter.sort
 *    The column name to use for sorting.
 * @property {string} filter.direction
 *    The sorting direction ('asc' for ascending, 'desc' for descending).
 * @property {number} filter.limit
 *    The maximum number of records to return.
 * @property {number} filter.offset
 *    The number of records to skip before returning results.
 */

/**
 * @typedef {queryFilter[]} queryFilterArray
 */

/**
 * @typedef {Object} JX_ManyNext
 * @property {number} ix The current index of the iteration.
 * @property {boolean} done A boolean indicating if the iteration is complete.
 * @property {*} value The result of the function execution.
 * @property {string} run The name of the function executed.
 * @property {string} [error] Any error that occurred during the function execution.
 * @property {string} [tag] The tag associated with the task.
 */

