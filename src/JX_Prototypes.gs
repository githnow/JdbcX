/**
 * @fileoverview Public methods to run
 * on a JdbcX instance obtained from the library.
 * 
 * Functions to execute from a user's script.
 */

// ============
//    BASIC   #
// ============

/**
 * ### Description
 * Executes a given SQL query on the specified database and returns the resulting
 * of execute. The query is executed using a statement created from the
 * database connection.
 *
 * @memberof {JdbcX}
 *
 * @param {string} sql The SQL statement to execute.
 * @param {string=} db __Optional__: The name of the database to connect to.
 * @return {boolean} `true` if the first result is a result set; `false` if it is
 *     an update count or if there are no results.
 */
function execute(sql, db) { return this._execute.apply(this, arguments) }
JdbcX.prototype.execute = function() { return execute.apply(this, arguments) };


/**
 * ### Description
 * Executes a given SQL query on the specified database and returns the resulting
 * `JdbcResultSet` object. The query is executed using a statement created from the
 * database connection.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const sql = "SELECT * FROM users";
 * const resultSet = conn.executeQuery(sql, 'myDatabase');
 * while (resultSet.next()) {
 *   console.log(resultSet.getString(1)); // Outputs the first column of each row
 * }
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} sql The SQL statement to execute, typically a static `SELECT`.
 * @param {string=} db __Optional__: The name of the database to connect to.
 *
 * @return {JdbcResultSet} A result set containing the results of the execution.
 *     This is never `null`.
 */
function executeQuery(sql, db) { return this._executeQuery.apply(this, arguments) }
JdbcX.prototype.executeQuery = function() { return executeQuery.apply(this, arguments) };


/**
 * ### Description
 * Executes an SQL update statement (INSERT, UPDATE, DELETE)
 * against the specified database.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var sql = "UPDATE users SET name = 'John Doe' WHERE id = 1";
 * var result = conn.executeUpdate(sql, "myDatabase");
 * console.log(result); // Outputs: the row count for DML statements or 0 for statements that return nothing
 * ```
 *
 * Additional Examples:
 * ```js
 * // Update a user's email
 * var sql = "UPDATE users SET email = 'new_email@example.com' WHERE id = 123";
 * var result = conn.executeUpdate(sql, "myDatabase");
 * console.log(result); // Outputs: the row count for the update statement
 * 
 * // Insert a new user
 * var sql = "INSERT INTO users (name, email) VALUES ('John Doe', 'john.doe@example.com')";
 * var result = conn.executeUpdate(sql, "myDatabase");
 * console.log(result); // Outputs: the row count for the insert statement
 * 
 * // Delete a user by ID
 * var sql = "DELETE FROM users WHERE id = 456";
 * var result = conn.executeUpdate(sql, "myDatabase");
 * console.log(result); // Outputs: the row count for the delete statement
 * 
 * // Update product prices in a category
 * var sql = "UPDATE products SET price = price * 1.1 WHERE category = 'electronics'";
 * var result = conn.executeUpdate(sql, "myDatabase");
 * console.log(result); // Outputs: the row count for the update statement
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} sql The SQL update statement to execute.
 * @param {string=} db __Optional__: The name of the database to execute
 *     the update against.
 *
 * @returns {number} Either (1) the row count for SQL Data Manipulation Language (DML) 
 *     statements or (2) 0 for SQL statements that return nothing.
 */
function executeUpdate(sql, db) { return this._executeUpdate.apply(this, arguments) }
JdbcX.prototype.executeUpdate = function() { return executeUpdate.apply(this, arguments) };


// =============
//     READ    #
// =============

/**
 * ### Description
 * Executes a given SQL query on a database connection and returns the results as an
 * array of arrays. Each inner array represents a row of the result set, with each
 * element in the inner array representing a column value.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const query = "SELECT id, name FROM users";
 * const results = conn.queryDatabase(query);
 * console.log(results); // Outputs: [['1', 'John Doe'], ['2', 'Jane Smith'], ...]
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} query The SQL query to be executed.
 * @param {string=} db __Optional__: The name of the database to connect to.
 *
 * @return {Array<Array<string>>} An array of arrays containing the result set rows
 *     and columns. If an error occurs, an empty array is returned.
 */
function queryDatabase(query, db) { return this._queryDatabase.apply(this, arguments) }
JdbcX.prototype.queryDatabase = function() { return queryDatabase.apply(this, arguments) };


// =============
//   GET INFO  #
// =============

// DATABASES
/**
 * ### Description
 * Retrieves a list of databases from the connected database server, excluding
 * system databases unless specified otherwise.

 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const databases = conn.getListDatabases(false);
 * console.log(databases); // Outputs: List of databases excluding system databases
 * ```
 * @memberof {JdbcX}
 *
 * @param {boolean} includeSystem Optionally include system databases.
 *     Default is `false`.
 * @returns {Array<string>} An array of database names.
 */
function getListDatabases(includeSystem) { return this._getListDatabases.apply(this, arguments) }
JdbcX.prototype.getListDatabases = function() { return getListDatabases.apply(this, arguments) };


// TABLES
/**
 * ### Description
 * Retrieves a list of tables from the specified database connection.
 *
 * The function executes a database-specific query to fetch the table names.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const tables = conn.getListTables();
 * console.log(tables); // Outputs: ['table1', 'table2', ...]
 * ```
 * @memberof {JdbcX}
 *
 * @param {string=} db __Optional__: The name of the database to retrieve
 *     tables from.
 *
 * @return {Array<string>} An array containing the names of the tables
 *     in the database. If an error occurs or no tables are found, an empty array
 *     is returned.
 */
function getListTables(db) { return this._getListTables.apply(this, arguments) }
JdbcX.prototype.getListTables = function() { return getListTables.apply(this, arguments) };


// COLUMNS
/**
 * ### Description
 * Retrieves a list of columns for a specified table from the database.
 *
 * The function executes a database-specific query to fetch the column names.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const columns = conn.getListColumns('tableName');
 * console.log(columns); // Outputs: ['column1', 'column2', ...]
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} table The name of the table for which to retrieve columns.
 * @param {string=} db __Optional__: The name of the database containing the table.
 *
 * @return {Array<string>} An array containing the names of the columns in the table.
 *     If an error occurs or no columns are found, an empty array is returned.
 */
function getListColumns(table, db) { return this._getListColumns.apply(this, arguments) }
JdbcX.prototype.getListColumns = function() { return getListColumns.apply(this, arguments) };


// SHOW INDEX FROM
/**
 * ### Description
 * Retrieves index information for a specified table from the database.
 *
 * The function executes a database-specific query to fetch index details.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const indexInfo = conn.getIndexInfo('tableName');
 * console.log(indexInfo); // Outputs: [['tableName', 'nonUnique', ...], ...]
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} table The name of the table for which to retrieve index information.
 * @param {string=} db __Optional__: The name of the database containing the table.
 * @param {boolean=} returnObject __Optional__: Whether to return index
 *     information as objects. Default is `false`.
 *
 * @return {Array<Array<string>>|Array<Object>} If returnObject is true, an array of
 *     objects containing index details is returned. If false or not specified, an
 *     array of arrays containing raw index data is returned. If an error occurs or
 *     no index information is found, an empty array is returned.
 */
function getIndexInfo(table, db, returnObject) { return this._getIndexInfo.apply(this, arguments) }
JdbcX.prototype.getIndexInfo = function() { return getIndexInfo.apply(this, arguments) };


// SHOW VARIABLES
/**
 * ### Description
 * Retrieves variables and their values from the database server.
 *
 * The function executes a database-specific query to fetch variable information.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const variables = conn.getVariables();
 * console.log(variables); // Outputs: [['variable1', 'value1'], ['variable2', 'value2'], ...]
 * ```
 * @memberof {JdbcX}
 *
 * @param {boolean=} returnObject __Optional__: Whether to return variables
 *     and their values as an object. Default is `false`.
 *
 * @return {Array<Array<string>>|Object} If returnObject is `true`, an object
 *     with variable names as keys and their corresponding values is returned.
 *     If `false` or not specified, an array with variable names and values is
 *     returned.
 */
function getVariables(returnObject) { return this._getVariables.apply(this, arguments) }
JdbcX.prototype.getVariables = function() { return getVariables.apply(this, arguments) };


// SHOW GRANTS FOR
/**
 * ### Description
 * Retrieves grants assigned to a specific user from the database server.
 *
 * The function executes a database-specific query to fetch the user's grants.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const grants = conn.getUserGrants('username');
 * console.log(grants); // Outputs: [['grant1'], ['grant2'], ...]
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} user The name of the user for which to retrieve grants.
 *
 * @return {Array<Array<string>>} An array containing the grants assigned to the user.
 *     If an error occurs or no grants are found, an empty array is returned.
 */
function getUserGrants(user) { return this._getUserGrants.apply(this, arguments) }
JdbcX.prototype.getUserGrants = function() { return getUserGrants.apply(this, arguments) };


// SHOW STATUS
/**
 * ### Description
 * Retrieves server status variables and their values from the database server.
 *
 * The function executes a database-specific query to fetch status information.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const status = conn.getStatus();
 * console.log(status); // Outputs: [['variable1', 'value1'], ['variable2', 'value2'], ...]
 * ```
 * @memberof {JdbcX}
 *
 * @param {boolean=} returnObject __Optional__: Whether to return status
 *     variables and their values as an object. Default is `false`.
 *
 * @return {Array<Array<string>>|Object} If returnObject is true, an object containing
 *     server status variables as keys and their corresponding values is returned.
 *     If false or not specified, an array of arrays containing status variable names
 *     and values is returned. If an error occurs or no status variables are found,
 *     an empty array or object is returned.
 */
function getStatus(returnObject) { return this._getStatus.apply(this, arguments) }
JdbcX.prototype.getStatus = function() { return getStatus.apply(this, arguments) };


// SHOW PROCESSLIST
/**
 * ### Description
 * Retrieves information about currently executing processes from the MySQL database
 * server. The function executes a database-specific query to fetch the process list.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const processList = conn.getProcessListMySQL();
 * console.log(processList); // Outputs: [{ id: '1', user: 'user1', ... }, { id: '2', user: 'user2', ... }, ...]
 * ```
 * @memberof {JdbcX}
 *
 * @param {boolean=} returnObject __Optional__: Whether to return process
 *     list information as objects. Default is `false`.
 *
 * @return {Array<Array<string>>|Array<Object>} If returnObject is true, an array
 *     of objects containing process details is returned. If false or not specified,
 *     an array of arrays containing raw process data is returned.
 *     If an error occurs or no processes are found, an empty array is returned.
 */
function getProcessListMySQL(returnObject) { return this._getProcessListMySQL.apply(this, arguments) }
JdbcX.prototype.getProcessListMySQL = function() { return getProcessListMySQL.apply(this, arguments) };


// USER LIST
/**
 * ### Description
 * Retrieves a list of users from the database server. The function executes a
 * database-specific query to fetch user information.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const userList = conn.getUserList();
 * console.log(userList); // Outputs: ['user1', 'user2', ...]
 * ```
 * @memberof {JdbcX}
 *
 * @return {Array<string>} An array containing the names of users in the database.
 *     If an error occurs or no users are found, an empty array is returned.
 */
function getUserList() { return this._getUserList.apply(this, arguments) }
JdbcX.prototype.getUserList = function() { return getUserList.apply(this, arguments) };


// NUMBER OF DATA ROWS
/**
 * ### Description
 * Executes a given SQL query on the specified database and returns
 * the count of records that match the specified criteria.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const sql = "SELECT * FROM `example_table` WHERE `user_id` BETWEEN '100' AND '120'";
 * const rowCount = conn.getRowCount(sql, 'myDatabase');
 * console.log(rowCount); // Outputs the count of matching records (21)
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} sql The SQL statement to execute for counting records.
 * @param {string=} db __Optional__: The name of the database to connect to.
 *
 * @return {number} The count of records matching the criteria.
 *     Returns `0` if no records match.
 * @throws {ValidationError} Throws an error if the SQL statement
 *     is not defined or does not contain a valid `SELECT` clause.
 */
function getRowCount(sql, db) { return this._getRowCount.apply(this, arguments) }
JdbcX.prototype.getRowCount = function() { return getRowCount.apply(this, arguments) };


/**
 * ### Description
 * Returns the count of records in a specified table that match
 * the given filter criteria.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const table = "example_table";
 * const filter = {
 *   column: "user_id",
 *   value_from: 100,
 *   value_to: 120
 * }
 * const rowCount = conn.getRowCountByFilter(table, filter);
 * console.log(rowCount); // Outputs the count of matching records (21)
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} table The name of the database table to query.
 * @param {queryFilter|queryFilter[]=} filter The filter object or array of objects
 *     to apply to the query, which contain options:
 *     - `column`: The name of the column to filter on.
 *     - `value`: The value to match in the specified column (WHERE '=').
 *     - `value_from`: The starting value for range-based filtering (WHERE '>').
 *     - `value_to`: The ending value for range-based filtering (WHERE '<').
 *     - `toUnixTime`: Indicates whether to convert the dates of the filter
 *       values to a timestamp (UNIX format).
 *     - `sort`: The column name to use for sorting.
 *     - `direction`: The sorting direction
 *       ('asc' for ascending, 'desc' for descending).
 *     - `limit`: The maximum number of records to return.
 *     - `offset`: The number of records to skip before returning results.
 *     - `like`: Matching. The value to match using LIKE %...%.
 *     - `notlike`: Matching. The value to exclude using NOT LIKE.
 *     - `regex`: Matching. The regular expression to match REGEXP.
 *
 *   If the `filter` parameter is an array of objects,
 *   the conditions will be combined using the AND operator.
 * @param {string=} db __Optional__: The name of the database to connect to.
 *
 * @return {number} The count of records matching the criteria.
 *     Returns `0` if no records match.
 * @throws {ValidationError} Throws an error if the table name
 *     is not defined.
 */
function getRowCountByFilter(table, filter, db) { return this._getRowCountByFilter.apply(this, arguments) }
JdbcX.prototype.getRowCountByFilter = function() { return getRowCountByFilter.apply(this, arguments) };


// =============
//    CREATE   #
// =============

/**
 * ### Description
 * Creates a new database if it does not already exist.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var dbName = "newDatabase";
 * var result = conn.createDatabase(dbName);
 * console.log(result); // Outputs: the result of the CREATE DATABASE statement
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} db The name of the database to create.
 *
 * @throws {Error} If the `db` parameter is not provided.
 *
 * @returns {any} The result of the `CREATE DATABASE` SQL statement.
 */
function createDatabase(db) { return this._createDatabase.apply(this, arguments) }
JdbcX.prototype.createDatabase = function() { return createDatabase.apply(this, arguments) };


/**
 * ### Description
 * Inserts a record into the specified database table.
 *
 * ### Examples
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var table = "users";
 * var columns = ["name", "email"];
 * var values = ["John Doe", "john.doe@example.com"];
 * var result = conn.insertInto(table, columns, values); // Default DB
 * console.log(result); // Outputs: 1 (the row count for the insert statement)
 * ```
 *
 * ```js
 * // Insert a new product
 * var table = "products";
 * var columns = ["name", "price", "category"];
 * var values = ["Laptop", 999.99, "electronics"];
 * var result = conn.insertInto(table, columns, values, "myDatabase");
 * console.log(result); // Outputs: 1 (the row count for the insert statement)
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} table The name of the database table to insert data into.
 * @param {Array<string>} columns An array of column names to insert data into.
 * @param {Array<any>} values An array of values to insert corresponding to the columns.
 * @param {string=} db Optional: The name of the database to connect to.
 *
 * @returns {number} The row count for SQL Data Manipulation Language (DML) statements (1).
 */
function insertInto(table, columns, values, db) { return this._insertInto.apply(this, arguments) }
JdbcX.prototype.insertInto = function() { return insertInto.apply(this, arguments) };


// =============
//    DELETE   #
// =============

/**
 * ### Description
 * Deletes a specified table from a database.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var tableName = "oldTable";
 * var result = conn.deleteTable(tableName);
 * console.log(result); // Outputs: true if the table was successfully deleted, otherwise false
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} table The name of the table to delete.
 * @param {string=} db The name of the database to connect to.
 *     If not provided, the default database is used.
 *
 * @throws {Error} If the `table` parameter is not provided.
 *
 * @returns {boolean} `true` if the table was successfully deleted, otherwise `false`.
 */
function deleteTable(table, db) { return this._deleteTable.apply(this, arguments) }
JdbcX.prototype.deleteTable = function() { return deleteTable.apply(this, arguments) };



// ===============
//    EXTENDED   #
// ===============
//    Read       #
// ===============
// getDataFromCloud

/**
 * ### Description
 * Retrieves data from a specified database table based on the given columns, return
 * type, and filter. The function generates an SQL query using the provided table,
 * columns, and filter criteria, and returns the results either as an array or an
 * object based on the specified return type.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var table = "users";
 * var columns = ["id", "name", "email"];
 * var returnType = 1; // 0 for nested objects, 1 for object with arrays
 * var filter = { column: "active", value_from: true, sort: "name", direction: "asc" };
 * var db = "myDatabase";
 * var data = conn.retrieveDataFromDB(table, columns, returnType, filter, db);
 * console.log(data); // Outputs the data retrieved from the database
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} table The name of the database table to query.
 * @param {string|Array<string>} columns The columns to retrieve, either as a comma-
 *     separated string or an array of strings.
 * @param {number=} returnType The return type, default - 0:
 *     0 - Returns data as an array of nested objects, where each object represents a row.
 *     1 - Returns data as an object with arrays, where each array represents a column.
 * @param {queryFilter|queryFilter[]=} filter The filter object or array of objects
 *     to apply to the query, which contain options:
 *     - `column`: The name of the column to filter on.
 *     - `value`: The value to match in the specified column (WHERE '=').
 *     - `value_from`: The starting value for range-based filtering (WHERE '>').
 *     - `value_to`: The ending value for range-based filtering (WHERE '<').
 *     - `toUnixTime`: Indicates whether to convert the dates of the filter
 *       values to a timestamp (UNIX format).
 *     - `sort`: The column name to use for sorting.
 *     - `direction`: The sorting direction
 *       ('asc' for ascending, 'desc' for descending).
 *     - `limit`: The maximum number of records to return.
 *     - `offset`: The number of records to skip before returning results.
 *     - `like`: Matching. The value to match using LIKE %...%.
 *     - `notlike`: Matching. The value to exclude using NOT LIKE.
 *     - `regex`: Matching. The regular expression to match REGEXP.
 *
 *   If the `filter` parameter is an array of objects,
 *   the conditions will be combined using the AND operator.
 * @param {string=} db __Optional__: The name of the database to query.
 *
 * @return {Array<Object>|Object} The data retrieved from the database, either as an
 *     array of arrays or an array of objects based on the return type.
 */
function retrieveDataFromDB(table, columns, returnType, filter, db) { return this._retrieveDataFromDB.apply(this, arguments) }
JdbcX.prototype.retrieveDataFromDB = function() { return retrieveDataFromDB.apply(this, arguments) };


/**
 * ### Description
 * Executes a SQL query on a specified database and returns the results as an array
 * of objects. Each object represents a row of data with key-value pairs corresponding
 * to column names and their values. If the query encounters an error due to an unknown
 * column, it attempts to retry the query up to a maximum of five times, adjusting the
 * query each time.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var sql_query = "SELECT id, name FROM users";
 * var columns = ["id", "name"];
 * var db = "myDatabase";
 * var data = conn.getTableAsObject(sql_query, columns, db);
 * console.log(data); // Outputs: [{ id: "1", name: "John" }, { id: "2", name: "Jane" }]
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} sql_query The SQL query to be executed.
 * @param {Array<string>} columns The columns to retrieve, used for validation and
 *     restructuring the query in case of errors.
 * @param {string=} db __Optional__: The name of the database to query.
 *
 * @return {Array<object>} An array of objects, where each object represents a row of
 *     data with key-value pairs for column names and their corresponding values.
 *     If an error occurs beyond the allowed retries, an empty array is returned.
 */
function getTableAsObject(sql_query, columns, db) { return this._getTableAsObject.apply(this, arguments) }
JdbcX.prototype.getTableAsObject = function() { return getTableAsObject.apply(this, arguments) };


/**
 * ### Description
 * Executes a SQL query on a specified database and returns the results as an array.
 * The results include column headers and rows of data. If the query encounters an
 * error due to an unknown column, it attempts to retry the query up to a maximum of
 * five times, adjusting the query each time.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var sql_query = "SELECT id, name FROM users";
 * var columns = ["id", "name"];
 * var db = "myDatabase";
 * var data = conn.getTableAsArray(sql_query, columns, db);
 * console.log(data); // Outputs: { columns: ["id", "name"], data: [["1", "John"], ...], items: 2 }
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} sql_query The SQL query to be executed.
 * @param {Array<string>} columns The columns to retrieve, used for validation and
 *     restructuring the query in case of errors.
 * @param {string=} db __Optional__: The name of the database to query.
 *
 * @return {object} An object containing the results of the query with the following
 *     properties:
 *     - `columns`: An array of column names.
 *     - `data`: An array of arrays, where each inner array represents a row of data.
 *     - `items`: The number of rows retrieved.
 *     If an error occurs beyond the allowed retries, an empty object is returned.
 */
function getTableAsArray(sql_query, columns, db) { return this._getTableAsArray.apply(this, arguments) }
JdbcX.prototype.getTableAsArray = function() { return getTableAsArray.apply(this, arguments) };


// =============
//    Insert   #
// =============

/**
 * ### Description
 * MySQL. Inserts an array of data into a specified database table.
 * The function constructs an SQL INSERT query based on the provided table name,
 * header, and data, allowing customization options such as auto-commit and
 * handling of duplicate entries.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var table = "users";
 * var columns = ["id", "name", "email"];
 * var dataRows = [
 *   [1, "John", "john@example.com"],  // Row 1
 *   [2, "Jane", "jane@example.com"],  // Row 2
 * ];
 * var options = { 
 *   db: "myDatabase",  // if not default
 *   autoCommit: true,
 *   updateDuplicates: true
 * };
 * var success = conn.insertArrayToDBTable(table, columns, dataRows, options);
 * console.log(success); // Outputs: true if the data was successfully inserted
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} table The name of the database table to insert data into.
 * @param {Array<string>} columns An array containing the column headers of the table.
 * @param {Array<Array<any>>} data An array of arrays representing the data to be inserted.
 * @param {insertOptions=} options Additional options for customizing the insert operation:
 *     - `db`: The name of the database to connect to. If not provided, the default
 *       database is used.
 *     - `autoCommit`: A boolean indicating whether to automatically commit
 *       the transaction. Defaults to `false`.
 *     - `batchSize`: A positive integer, when autoCommit is enabled, determines
 *       the number of records that will be grouped and sent to the database
 *       in a single batch operation. The default value is `100`.
 *     - `updateDuplicates` or `updateDupls`: A boolean indicating whether to update
 *       duplicate entries if they exist in the table. Defaults to `false`.
 *     - `detectTypes`: A boolean indicating whether to automatically detect
 *       the data types in the array and use them for the insert operation.
 *       If set to `true`, the library will analyze the data being inserted
 *       and determine the appropriate data types for each column.
 *       If detectTypes is set to `false`, all data will be treated as strings,
 *       regardless of the `stringTypes` option.
 *       Enable it if you use date values in the date format, blob objects,
 *       boolean values, or if you need strict compliance with data types.
 *       Defaults to `true`.
 *     - `stringTypes`: An array of data types that should be treated as strings
 *       (e.g., `integer`, `double`, `object`, `array`, `boolean`) when
 *       the `detectTypes` option is enabled.
 * @return {boolean} A boolean value indicating whether the data was successfully
 *     inserted into the database table.
 */
function insertArrayToDBTable(table, columns, data, options) { return this._insertArrayToDBTable.apply(this, arguments) }
JdbcX.prototype.insertArrayToDBTable = function() { return insertArrayToDBTable.apply(this, arguments) };

