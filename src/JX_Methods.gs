/**
 * @fileoverview Private utility script for defining and allowing methods
 * within the `jdbcx` object. Initializes specific methods for use within
 * the `AsyncDoMany` function.
 */

/**
 * Executes a given SQL query on the specified database and returns the resulting
 * `JdbcResultSet` object. The query is executed using a statement created from the
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
 * {number} Either (1) the row count for SQL Data Manipulation Language (DML) 
 * statements or (2) 0 for SQL statements that return nothing.
 * 
 * @see executeUpdate
 * @memberof {METHODS}
 * @property {string} sql The SQL update statement to execute.
 * @property {string} [db] The name of the database to execute the update against.
 */
var executeUpdate = "executeUpdate";


/**
 * Executes a given SQL query on a database connection and returns the results as an
 * array of arrays. Each inner array represents a row of the result set, with each
 * element in the inner array representing a column value.
 *
 * ### Return
 * {Array<Array<string>>} An array of arrays containing the result set rows
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
 * @property {Array<string>} columns An array of column names to insert data into.
 * @property {Array<any>} values An array of values to insert corresponding to the columns.
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
 * {Array<Object>|Object} The data retrieved from the database, either
 * as an array of arrays or an array of objects based on the return type.
 * 
 * @see retrieveDataFromDB
 * @memberof {METHODS}
 * @property {string} table The name of the database table to query.
 * @property {string|Array<string>} columns The columns to retrieve, either as a comma-
 *     separated string or an array of strings.
 * @property {number} [returnType] The return type, default is `0`:
 *     0 - Returns data as an array of nested objects, where each object represents a row.
 *     1 - Returns data as an object with arrays, where each array represents a column.
 * @property {queryFilter} filter The filter object to apply to the query, which can contain
 *     properties such as `column`, `value_from`, `value_to`, `toUnixTime`, `sort`,
 *     `direction`, and `limit`.
 * @property {string} db The name of the database to query.
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
 * {Array<Object>} An array of objects, where each object represents a row of
 * data with key-value pairs for column names and their corresponding values.
 * If an error occurs beyond the allowed retries, an empty array is returned.
 *
 * @see getTableAsObject
 * @memberof {METHODS}
 * @property {string} sql_query The SQL query to be executed.
 * @property {Array<string>} columns The columns to retrieve, used for validation and
 *     restructuring the query in case of errors.
 * @property {string} db The name of the database to query.
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
 * @property {Array<string>} columns The columns to retrieve, used for validation and
 *     restructuring the query in case of errors.
 * @property {string} db The name of the database to query.
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
 * @see insertArrayToDBTable
 * @memberof {METHODS}
 * @property {string} table The name of the database table to insert data into.
 * @property {Array<string>} columns An array containing the column headers of the table.
 * @property {Array<Array<any>>} data An array of arrays representing the data to be inserted.
 * @property {Object} [options] Additional options for customizing the insert operation:
 *   - `db`: The name of the database to connect to. If not provided, the default
 *     database is used.
 *   - `autoCommit`: A boolean indicating whether to automatically commit the transaction.
 *     Defaults to `false`.
 *   - `updateDuplicates` or `updateDupls`: A boolean indicating whether to update
 *     duplicate entries if they exist in the table. Defaults to `false`.
 *   - `stringTypes`: An array of data types that should be treated as strings
 *     (e.g., `integer`, `double`, `object` | `array`, `boolean`).
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

