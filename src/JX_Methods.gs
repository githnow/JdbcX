/**
 * @fileoverview Private utility script for defining and allowing methods
 * within the `jdbcx` object. Initializes specific methods for use within
 * the `AsyncDoMany` function.
 */

/**
 * Executes a given SQL query on the specified database and returns the resulting
 * of execute. The query is executed using a statement created from the
 * database connection.
 *
 * ### Return
 * {boolean} `true` if the first result is a result set;
 * `false` if it is an update count or if there are no results.
 *
 * @see execute
 * @memberof {METHODS}
 * @property {string} sql The SQL statement to execute.
 * @property {string} [db] __Optional__: The name of the database to connect to.
 */
var execute = "execute";


/**
 * Executes a given SQL query on the specified database and returns the resulting
 * `JdbcResultSet` object. The query is executed using a statement created from the
 * database connection.
 *
 * ### Return
 * {JdbcResultSet} A result set containing the results of the execution.
 * This is never `null`.
 *
 * @see executeQuery
 * @memberof {METHODS}
 * @property {string} sql The SQL statement to execute, typically a static `SELECT`.
 * @property {string} [db] __Optional__: The name of the database to connect to.
 */
var executeQuery = "executeQuery";


/**
 * Executes an SQL update statement (INSERT, UPDATE, DELETE) against
 * the specified database.
 *
 * ### Return
 * {number} Either the row count for SQL Data Manipulation Language (DML)
 * statements, or 0 for SQL statements that return nothing.
 *
 * @see executeUpdate
 * @memberof {METHODS}
 * @property {string} sql The SQL update statement to execute.
 * @property {string} [db] __Optional__: The name of the database to execute the update against.
 */
var executeUpdate = "executeUpdate";


/**
 * Executes a given SQL query on a database connection and returns the results as an
 * array of arrays. Each inner array represents a row of the result set, with each
 * element in the inner array representing a column value.
 *
 * ### Return
 * {Array[]} An array of arrays containing the result set rows
 * and columns. If an error occurs, an empty array is returned.
 *
 * @see queryDatabase
 * @memberof {METHODS}
 * @property {string} query The SQL query to be executed.
 * @property {string} [db] __Optional__: The name of the database to connect to.
 */
var queryDatabase = "queryDatabase";


/**
 * Inserts a record into the specified database table.
 *
 * ### Return
 * {number} The row count for SQL Data Manipulation Language (DML) statements (1).
 *
 * @see insertInto
 * @memberof {METHODS}
 * @property {string} table The name of the database table to insert data into.
 * @property {string[]} columns An array of column names to insert data into.
 * @property {any[]} values An array of values to insert corresponding to the columns.
 * @property {string} [db] __Optional__: The name of the database to connect to.
 */
var insertInto = "insertInto";


/**
 * Retrieves data from a specified database table based on the given columns, return
 * type, and filter. The function generates an SQL query using the provided table,
 * columns, and filter criteria, and returns the results either as an array or an
 * object based on the specified return type.
 *
 * ### Return
 * __Array__ or __Object__. The data retrieved from the database, either
 * as an array of arrays or an array of objects based on the return type:
 *   - 0 - Returns data as an array of nested objects, where each object represents a row.
 *   - 1 - Returns data as an object with arrays, where each array represents a column.
 *
 * #### Filter contain the options:
 *   - `column`: The name of the column to filter on.
 *   - `value`: The value to match in the specified column (WHERE '=').
 *   - `value_from`: The starting value for range-based filtering (WHERE '>').
 *   - `value_to`: The ending value for range-based filtering (WHERE '<').
 *   - `toUnixTime`: Indicates whether to convert the dates of the filter
 *     values to a timestamp (UNIX format).
 *   - `sort`: The column name to use for sorting.
 *   - `direction`: The sorting direction
 *     ('asc' for ascending, 'desc' for descending).
 *   - `limit`: The maximum number of records to return.
 *   - `offset`: The number of records to skip before returning results.
 *   - `like`: Matching. The value to match using LIKE %...%.
 *   - `notlike`: Matching. The value to exclude using NOT LIKE.
 *   - `regex`: Matching. The regular expression to match REGEXP.
 * If the `filter` parameter is an array of objects,
 * the conditions will be combined using the AND operator.
 *
 * @see retrieveDataFromDB
 * @memberof {METHODS}
 * @property {string} table The name of the database table to query.
 * @property {string|Array<string>} columns The columns to retrieve as a string or array of strings.
 * @property {number} [returnType] The return type, default is `0`.
 * @property {queryFilter|queryFilter[]} [filter] The filter object(s) to apply to the query.
 * @property {string} [db] __Optional__: The name of the database to query.
 */
var retrieveDataFromDB = "retrieveDataFromDB";


/**
 * Executes a SQL query on a specified database and returns the results as an array
 * of objects. Each object represents a row of data with key-value pairs corresponding
 * to column names and their values. If the query encounters an error due to an unknown
 * column, it attempts to retry the query up to a maximum of five times, adjusting the
 * query each time.
 *
 * ### Return
 * {Object[]} An array of objects, where each object represents a row of
 * data with key-value pairs for column names and their corresponding values.
 * If an error occurs beyond the allowed retries, an empty array is returned.
 *
 * @see getTableAsObject
 * @memberof {METHODS}
 * @property {string} sql_query The SQL query to be executed.
 * @property {string[]} columns The columns to retrieve.
 * @property {string} [db] __Optional__: The name of the database to query.
 */
var getTableAsObject = "getTableAsObject";


/**
 * Executes a SQL query on a specified database and returns the results as an array.
 * The results include column headers and rows of data. If the query encounters an
 * error due to an unknown column, it attempts to retry the query up to a maximum of
 * five times, adjusting the query each time.
 *
 * ### Return
 * {Object} An object containing the results of the query with the following
 * properties:
 *   - `columns`: An array of column names.
 *   - `data`: An array of arrays, where each inner array represents a row of data.
 *   - `items`: The number of rows retrieved.
 * If an error occurs beyond the allowed retries, an empty object is returned.
 *
 * @see getTableAsArray
 * @memberof {METHODS}
 * @property {string} sql_query The SQL query to be executed.
 * @property {string[]} columns The columns to retrieve.
 * @property {string} [db] __Optional__: The name of the database to query.
 */
var getTableAsArray = "getTableAsArray";


/**
 * Inserts an array of data into a specified database table. The function constructs
 * an SQL INSERT query based on the provided table name, header, and data, allowing
 * customization options such as auto-commit and handling of duplicate entries.
 *
 * ### Return
 * {boolean} A boolean value indicating whether the data was successfully
 * inserted into the database table.
 *
 * #### Options include:
 *   - `db`: The name of the database to connect to. If not provided, the default
 *     database is used.
 *   - `autoCommit`: A boolean indicating whether to automatically commit
 *     the transaction. Defaults to `false`.
 *   - `batchSize`: A positive integer, when autoCommit is enabled, determines
 *     the number of records that will be grouped and sent to the database
 *     in a single batch operation. The default value is `100`.
 *   - `updateDuplicates` or `updateDupls`: A boolean indicating whether to update
 *     duplicate entries if they exist in the table. Defaults to `false`.
 *   - `detectTypes`: A boolean indicating whether to automatically detect
 *     the data types in the array and use them for the insert operation.
 *     If set to `true`, the library will analyze the data being inserted
 *     and determine the appropriate data types for each column.
 *     If detectTypes is set to `false`, all data will be treated as strings,
 *     regardless of the `stringTypes` option.
 *     Enable it if you use date values in the date format, blob objects,
 *     boolean values, or if you need strict compliance with data types.
 *     Defaults to `true`.
 *   - `stringTypes`: An array of data types that should be treated as strings
 *     (e.g., `integer`, `double`, `object`, `array`, `boolean`) when
 *     the `detectTypes` option is enabled.
 *
 * @see insertArrayToDBTable
 * @memberof {METHODS}
 * @property {string} table The name of the database table to insert data into.
 * @property {string[]} columns An array containing the column headers of the table.
 * @property {any[][]} data An array of arrays representing the data to be inserted.
 * @property {Object} [options] Additional options for customizing the insert operation.
 */
var insertArrayToDBTable = "insertArrayToDBTable";


/**
 * Available methods to AsyncDoMany.
 */
Exports([
    execute,
    executeQuery,
    executeUpdate,
    queryDatabase,
    insertInto,
    retrieveDataFromDB,
    getTableAsObject,
    getTableAsArray,
    insertArrayToDBTable,
], 'methods');


/**
 * Reference to the defined methods.
 * @description Methods of JdbcX
 * @typedef {Object} METHODS
 * @type {METHODS}
 * @memberof {JdbcX}
 * @enum
 */
var METHODS = jdbcx.methods;

