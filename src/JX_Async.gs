/**
 * @fileoverview Public methods to run "asynchronously"
 * on a JdbcX instance obtained from the library.
 * 
 * Functions to execute from a user's script.
 */

// ============
//   GENERAL  #
// ============

/**
 * ### Desciption
 * The `AsyncDoMany` function is designed to execute multiple asynchronous tasks,
 * specified in the `tasks` parameter. Each task is defined by a function, its
 * arguments, and an optional tag. The function aggregates all tasks and executes
 * them, returning an iterator that allows for the retrieval of each task's result
 * one by one using the `next` method.
 * 
 * The method is capable of running up to 20 parallel threads simultaneously.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var stmt = 'SELECT * ..';
 * var tasks = conn.AsyncDoMany([
 *       [conn.METHODS.execute, [stmt, my_db], "tag-1"],
 *       [conn.METHODS.executeQuery, [stmt], "tag-2"],
 * ]);
 * 
 * var data = tasks.next();
 *
 * while (!result.done) {
 *       console.log(result.value);
 *       result = data.next();
 * }
 * ```
 * @memberof {JdbcX}
 *
 * @param {Array} tasks An array of tasks to be executed asynchronously.
 *     Each task is represented as __an array__ where:
 *      - The first element is the function to be executed (from METHODS).
 *      - The second element (optional) is an array of arguments for the function.
 *      - The third element (optional) is a tag to identify the task.
 *
 * @return {AsyncDoMany}
 */
function AsyncDoMany(tasks) {
  var index = 0;
  var results = [];
  var resource = [];
  var max_threads = 20;

  tasks = tasks.length > max_threads
    ? (
        LW("Tasks overload"),
        tasks.slice(0, max_threads)
      )
    : tasks;

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    var fn = task[0];
    var args = task.length > 1 ? task[1] : [];
    var tag = task.length > 2 ? task[2] : "";
    if (fn && fn in METHODS) {
      resource.push({
        functionName: fn,
        arguments: args,
        tag: tag
      });
    }
  }

  if (resource.length === 0)
    throw new Error("No available methods to run.");

  var execute = function(t) {
    var run = t._DoMany(resource);
    var res = run.map(function (r) {
      return JSON.parse(r.getContentText());
    });
    results = res;
  };

  /**
   * ### Description
   * @see empty_next for a description.
   */
  var next = function() {
    if (index < results.length) {
      var result = results[index++];
      return {
        'ix': index,
        'done': false,
        'error': result.Error,
        'value': result.Result,
        'run': result.FunctionName,
        'tag': result.Tag
      };
    } else {
      return { 'ix': -1, 'done': true, 'result': undefined };
    }
  };

  execute(this);
  return { next: next };
}
JdbcX.prototype.AsyncDoMany = function() { return AsyncDoMany.apply(this, arguments) };


/**
 * ### Description
 * The `next` function is an iterator method that retrieves the next result
 * from the executed tasks. It returns an object with the properties:
 * - `ix`: The current index of the iteration.
 * - `done`: A boolean indicating if the iteration is complete.
 * - `value`: The result of the function execution.
 * - `run`: The name of the function executed.
 * - `error`: Any error that occurred during the function execution.
 * - `tag`: The tag associated with the task.
 *
 * @name next
 * @memberof {AsyncDoMany}
 * @return {JX_ManyNext} An object containing the result of the next task
 *      or indicating the iteration is complete.
 */
function empty_next() {}


// ============
//    BASIC   #
// ============
/**
 * ### Description
 * Asynchronously executes a given SQL query on the specified database in a separate
 * thread and returns the resulting of execute. The query is executed using
 * a statement created from the database connection.
 *
 * @memberof {JdbcX}
 *
 * @param {string} sql The SQL statement to execute.
 * @param {string=} db __Optional__: The name of the database to connect to.
 * @return {boolean} `true` if the first result is a result set; `false` if it is
 *     an update count or if there are no results.
 */
function executeAsync(sql, db) {
  var resource = {
      functionName: "_execute",
      arguments: Array.prototype.slice.call(arguments),
      tag: 'jdbcx'
  };
  return this.DoOneTask(resource);
}
JdbcX.prototype.executeAsync = function() { return executeAsync.apply(this, arguments) };


/**
 * ### Description
 * Asynchronously executes a given SQL query on the specified database in a separate
 * thread and returns the resulting `JdbcResultSet` object. The query is executed
 * using a statement created from the database connection.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const sql = "SELECT * FROM users";
 * const resultSet = conn.executeQueryAsync(sql, 'myDatabase');
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
function executeQueryAsync(sql, db) {
  var resource = {
      functionName: "_executeQuery",
      arguments: Array.prototype.slice.call(arguments),
      tag: 'jdbcx'
  };
  return this.DoOneTask(resource);
}
JdbcX.prototype.executeQueryAsync = function() { return executeQueryAsync.apply(this, arguments) };


/**
 * ### Description
 * Asynchronously executes an SQL update statement (INSERT, UPDATE, DELETE)
 * against the specified database in a separate thread.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var sql = "UPDATE users SET name = 'John Doe' WHERE id = 1";
 * var result = conn.executeUpdateAsync(sql, "myDatabase");
 * console.log(result); // Outputs: the row count for DML statements or 0 for statements that return nothing
 * ```
 *
 * Additional Examples:
 * ```js
 * // Update a user's email
 * var sql = "UPDATE users SET email = 'new_email@example.com' WHERE id = 123";
 * var result = conn.executeUpdateAsync(sql, "myDatabase");
 * console.log(result); // Outputs: the row count for the update statement
 * 
 * // Insert a new user
 * var sql = "INSERT INTO users (name, email) VALUES ('John Doe', 'john.doe@example.com')";
 * var result = conn.executeUpdateAsync(sql, "myDatabase");
 * console.log(result); // Outputs: the row count for the insert statement
 * 
 * // Delete a user by ID
 * var sql = "DELETE FROM users WHERE id = 456";
 * var result = conn.executeUpdateAsync(sql, "myDatabase");
 * console.log(result); // Outputs: the row count for the delete statement
 * 
 * // Update product prices in a category
 * var sql = "UPDATE products SET price = price * 1.1 WHERE category = 'electronics'";
 * var result = conn.executeUpdateAsync(sql, "myDatabase");
 * console.log(result); // Outputs: the row count for the update statement
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} sql The SQL update statement to execute.
 * @param {string=} db The name of the database to execute the update against.
 *
 * @returns {number} Either (1) the row count for SQL Data Manipulation Language (DML)
 *     statements or (2) 0 for SQL statements that return nothing.
 */
function executeUpdateAsync(sql, db) {
  var resource = {
      functionName: "_executeUpdate",
      arguments: Array.prototype.slice.call(arguments),
      tag: 'jdbcx'
  };
  return this.DoOneTask(resource);
}
JdbcX.prototype.executeUpdateAsync = function() { return executeUpdateAsync.apply(this, arguments) };


// =============
//     READ    #
// =============

/**
 * ### Description
 * Asynchronously executes a given SQL query on a database connection in a separate
 * thread and returns the results as an array of arrays. Each inner array represents
 * a row of the result set, with each element in the inner array representing a
 * column value.
 *
 * ### Example
 * ```js
 * const conn = JdbcX.getConnection(config);
 * const query = "SELECT id, name FROM users";
 * const results = conn.queryDatabaseAsync(query);
 * console.log(results); // Outputs: [['1', 'John Doe'], ['2', 'Jane Smith'], ...]
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} query The SQL query to be executed.
 * @param {string=} db __Optional__: The name of the database to connect to.
 *
 * @return {Array<Array<string>>} An array of arrays containing the result set rows
 *     and columns. If an error occurs, an empty array is returned.
 *
 */
function queryDatabaseAsync(query, db) {
  var resource = {
      functionName: "_queryDatabase",
      arguments: Array.prototype.slice.call(arguments),
      tag: 'jdbcx'
  };
  return this.DoOneTask(resource);
}
JdbcX.prototype.queryDatabaseAsync = function() { return queryDatabaseAsync.apply(this, arguments) };


// =============
//    CREATE   #
// =============

/**
 * ### Description
 * Inserts a record into the specified database table asynchronously.
 *
 * ### Examples
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var table = "users";
 * var columns = ["name", "email"];
 * var values = ["John Doe", "john.doe@example.com"];
 * var result = conn.insertIntoAsync(table, columns, values); // Default DB
 * console.log(result); // Outputs: 1 (the row count for the insert statement)
 * ```
 *
 * ```js
 * // Insert a new product
 * var table = "products";
 * var columns = ["name", "price", "category"];
 * var values = ["Laptop", 999.99, "electronics"];
 * var result = conn.insertIntoAsync(table, columns, values, "myDatabase");
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
function insertIntoAsync(sql, db) {
  var resource = {
      functionName: "_insertInto",
      arguments: Array.prototype.slice.call(arguments),
      tag: 'jdbcx'
  };
  return this.DoOneTask(resource);
}
JdbcX.prototype.insertIntoAsync = function() { return insertIntoAsync.apply(this, arguments) };



// ===============
//    EXTENDED   #
// ===============
//    Read       #
// ===============

/**
 * ### Description
 * Asynchronously retrieves data from a specified database table based on the given
 * columns, return type, and filter. The function generates an SQL query using the
 * provided table, columns, and filter criteria, and returns the results either as
 * an array or an object based on the specified return type.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var table = "users";
 * var columns = ["id", "name", "email"];
 * var returnType = 1; // 0 for nested objects, 1 for object with arrays
 * var filter = { column: "active", value_from: true, sort: "name", direction: "asc" };
 * var db = "myDatabase";
 * var data = conn.retrieveDataFromDBAsync(table, columns, returnType, filter, db);
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
 * @param {queryFilter} filter The filter object to apply to the query, which can contain
 *     properties such as `column`, `value`, `value_from`, `value_to`, `toUnixTime`,
 *     `sort`, `direction`, `limit` and `offset`.
 * @param {string} db The name of the database to query.
 *
 * @return {Array<Object>|Object} The data retrieved from the database, either as an
 *     array of arrays or an array of objects based on the return type.
 */
function retrieveDataFromDBAsync(table, columns, returnType, filter, db) {
  var resource = {
      functionName: "_retrieveDataFromDB",
      arguments: Array.prototype.slice.call(arguments),
      tag: 'jdbcx'
  };
  return this.DoOneTask(resource);
}
JdbcX.prototype.retrieveDataFromDBAsync = function() { return retrieveDataFromDBAsync.apply(this, arguments) };


/**
 * ### Description
 * Asynchronously executes a SQL query on a specified database in a separate thread
 * and returns the results as an array of objects. Each object represents a row of
 * data with key-value pairs corresponding to column names and their values. If the
 * query encounters an error due to an unknown column, it attempts to retry the query
 * up to a maximum of five times, adjusting the query each time.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var sql_query = "SELECT id, name FROM users";
 * var columns = ["id", "name"];
 * var db = "myDatabase";
 * var data = conn.getTableAsObjectAsync(sql_query, columns, db);
 * console.log(data); // Outputs: [{ id: "1", name: "John" }, { id: "2", name: "Jane" }]
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} sql_query The SQL query to be executed.
 * @param {Array<string>} columns The columns to retrieve, used for validation and
 *     restructuring the query in case of errors.
 * @param {string} db The name of the database to query.
 *
 * @return {Array<object>} An array of objects, where each object represents a row of
 *     data with key-value pairs for column names and their corresponding values.
 *     If an error occurs beyond the allowed retries, an empty array is returned.
 */
function getTableAsObjectAsync(sql, db) {
  var resource = {
      functionName: "_getTableAsObject",
      arguments: Array.prototype.slice.call(arguments),
      tag: 'jdbcx'
  };
  return this.DoOneTask(resource);
}
JdbcX.prototype.getTableAsObjectAsync = function() { return getTableAsObjectAsync.apply(this, arguments) };


/**
 * ### Description
 * Asynchronously executes a SQL query on a specified database in a separate thread
 * and returns the results as an array. The results include column headers and rows
 * of data. If the query encounters an error due to an unknown column, it attempts
 * to retry the query up to a maximum of five times, adjusting the query each time.
 *
 * ### Example
 * ```js
 * var conn = JdbcX.getConnection(config);
 * var sql_query = "SELECT id, name FROM users";
 * var columns = ["id", "name"];
 * var db = "myDatabase";
 * var data = conn.getTableAsArrayAsync(sql_query, columns, db);
 * console.log(data); // Outputs: { columns: ["id", "name"], data: [["1", "John"], ...], items: 2 }
 * ```
 * @memberof {JdbcX}
 *
 * @param {string} sql_query The SQL query to be executed.
 * @param {Array<string>} columns The columns to retrieve, used for validation and
 *     restructuring the query in case of errors.
 * @param {string} db The name of the database to query.
 *
 * @return {object} An object containing the results of the query with the following
 *     properties:
 *     - `columns`: An array of column names.
 *     - `data`: An array of arrays, where each inner array represents a row of data.
 *     - `items`: The number of rows retrieved.
 *     If an error occurs beyond the allowed retries, an empty object is returned.
 */
function getTableAsArrayAsync(sql, db) {
  var resource = {
      functionName: "_getTableAsArray",
      arguments: Array.prototype.slice.call(arguments),
      tag: 'jdbcx'
  };
  return this.DoOneTask(resource);
}
JdbcX.prototype.getTableAsArrayAsync = function() { return getTableAsArrayAsync.apply(this, arguments) };


// =============
//    Insert   #
// =============

/**
 * ### Description
 * MySQL. Asynchronously inserts an array of data into a specified database table.
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
 * var success = conn.insertArrayToDBTableAsync(table, columns, dataRows, options);
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
 *     - `autoCommit`: A boolean indicating whether to automatically commit the transaction.
 *       Defaults to `false`.
 *     - `updateDuplicates` or `updateDupls`: A boolean indicating whether to update
 *       duplicate entries if they exist in the table. Defaults to `false`.
 *     - `detectTypes`: A boolean indicating whether to automatically detect
 *       the data types of the columns in the table and use them for the insert
 *       operation. If set to `true`, the library will analyze the data being 
 *       inserted and determine the appropriate data types for each column.
 *       If detectTypes is set to `false`, all data will be treated as strings,
 *       regardless of the `stringTypes` option. Defaults to `true`.
 *     - `stringTypes`: An array of data types that should be treated as strings
 *       (e.g., `integer`, `double`, `object` | `array`, `boolean`) when
 *       the `detectTypes` option is enabled.
 * @return {boolean} A boolean value indicating whether the data was successfully
 *     inserted into the database table.
 */
function insertArrayToDBTableAsync(table, columns, data, options) {
  var resource = {
      functionName: "_insertArrayToDBTable",
      arguments: Array.prototype.slice.call(arguments),
      tag: 'jdbcx'
  };
  return this.DoOneTask(resource);
}
JdbcX.prototype.insertArrayToDBTableAsync = function() { return insertArrayToDBTableAsync.apply(this, arguments) };

