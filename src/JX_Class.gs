/**
 * @license
 * Copyright githnow.
 * MIT License: https://opensource.org/licenses/MIT
 */

/**
 * @fileoverview The JdbcX class provides a set of enhanced functions
 * for asynchronous execution of operations with Google's Jdbc service.
 *
 * Allows running up to 20 parallel tasks, speeding up the execution time and access
 * to databases, primarily MySQL via Jdbc. Some functionality is also available
 * for PostgreSQL and SQL Server.
 *
 * Enhanced functions to simplify data retrieval and manipulation.
 *
 * JdbcX Library for Google App Scripts.
 * Author githnow.
 * GitHub https://github.com/githnow/JdbcX
 *
 * Asynchronous execution for Google App Scripts.
 * Parallel processing based on the RunPost method by tanaikech.
 * GitHub https://github.com/tanaikech/RunAll
 */

/**
 * @classdesc This is a class to handle JDBC connections.
 *
 * @param {JX_Config} config The configuration object for the connection.
 *     This object includes the following parameters:
 *     - `server` __Required__. The server address of the database.
 *       Do not include `https://`.
 *     - `port` __Required__. The server port on which the database is running.
 *       Common ports are 3306 for MySQL and 1433 for SQL Server.
 *     - `db` __Required__. The default database to connect to.
 *     - `prefix` __Required__. The prefix for the connection URL, which indicates
 *       the type of database. For example, 'jdbc:mysql://', 'jdbc:google:mysql://',
 *       or 'jdbc:sqlserver://'.
 *     - `userName` __Required__. The username to pass to the database.
 *     - `password` __Required__. The user's password.
 *     - `showTime` Optional flag to show the execution time of queries.
 *       Default - `true`.
 *     - `showLogs` Optional flag to show detailed logs. Default - `false`.
 *     - `muteSQLExceptions` Optional flag to mute SQL exceptions.
 *       If true, SQL exceptions will not be thrown. Default - `false`.
 *     - `project_id` Optional Google Cloud project ID. Used when connecting to
 *       Google Cloud SQL.
 *     - `region` Optional Google Cloud region. Used when connecting to Google
 *       Cloud SQL.
 *     - `instance` Optional Google Cloud instance. Used when connecting to Google
 *       Cloud SQL.
 *
 * @return {JdbcX} A new instance of the JdbcX class.
 */
function getConnection(config) {
  try {
    if (propUpdated) notifyUpdates();
  } catch (e) {
    //
  }
  return new JdbcX(config);
};


/**
 * @global
 * @class
 * @classdesc This is a class to handle JDBC connections.
 * @param {Object} config The configuration object for the connection.
 * @param {string} config.server The server address.
 * @param {number} config.port The server port.
 * @param {string} config.db The default database.
 * @param {string} config.prefix The prefix for the connection URL.
 * @param {string} config.userName The username for the connection.
 * @param {string} config.password The password for the connection.
 * @param {boolean=} [showTime] Optional flag to show execution time.
 * @param {boolean=} [showLogs] Optional flag to show logs.
 * @param {boolean=} [muteSQLExceptions] Optional flag to mute SQL exceptions.
 * @param {string=} [project_id] Optional Google Cloud project ID.
 * @param {string=} [region] Optional Google Cloud region.
 * @param {string=} [instance] Optional Google Cloud instance.
 *
 * @return {JdbcX}
 */
(function(r) {
  var JdbcX = (function() {
    JdbcX.name = "JdbcX";

    /**
     * @constructor
     */
    function JdbcX(config) {
        /** @private */
        this.url = "https://script.googleapis.com/v1/scripts/";
        /** @private */
        this.accessToken = ScriptApp.getOAuthToken();
        /** @private */
        this.webAppURL = getJXAppURL();
        /** @private */
        this.config = config;
        /** @private */
        this.currentDb = config.db;  // Current database
        /** @private */
        this.defaultDb = config.db;
        /** @private */
        this.showTime = config.showTime !== false;
        /** @private */
        this.showLogs = config.showLogs || false;
        /** @private */
        this.muteError = config.muteSQLExceptions || false;
        /** @private */
        this.databaseUrl = '';
        /**
         * Current connection.
         * @type {Jdbc.JdbcConnection}
         */
        this.conn = this.createConnection();
        if (this.conn) {
            L("%s is successful", this.conn);
            this.status = true;
        } else {
          if (this.showLogs) {
            LW("Please check the datebase url:", this.databaseUrl);
          }
        }
        /**
         * @private
         * @const
         * @protected
         */
        this.METHODS = METHODS;
    };


  // ===============
  //   CONNECTION  #
  // ===============

    JdbcX.prototype.createConnection = function() {
        return this.getConnection(this.defaultDb);
    };


    /**
     * Attempts to establish a connection to the specified database. If the connection
     * is already established and the current database matches the requested database,
     * the existing connection is reused.
     *
     * ### Example
     * ```js
     * const config = {
     *   prefix: 'jdbc:mysql://',
     *   server: 'localhost',
     *   port: '3306',
     *   userName: 'root',
     *   password: 'password'
     * };
     * const conn = JdbcX.getConnection('myDatabase', false);
     * console.log(conn); // Outputs: JdbcConnection object
     * ```
     *
     * @private
     * @param {string=} [dbName] The name of the database to connect to.
     * @param {boolean=} [isServerConnection] Indicates if the connection should be
     *     established only to the server, without specifying a particular database.
     *
     * @return {Jdbc.JdbcConnection} A JdbcConnection object.
     */
    JdbcX.prototype.getConnection = function(dbName, isServerConnection) {
      if (isServerConnection === undefined) isServerConnection = false;
      var database = isServerConnection ? "" : dbName || this.defaultDb;
      if (this.conn && this.currentDb === database) {
        // "using the current connection"
        return this.conn;
      }
      // "create a new connection"
      if (this.showLogs) L("Create a new connection");
      var config = this.config;
      var url;

      switch (config.prefix) {
        case 'jdbc:mysql://':
          url = config.prefix + config.server + ':' + config.port;
          url += database ? '/' + database : '/';
          break;
        case 'jdbc:postgresql://':
          if (config.project_id && config.region && config.instance) {
            url = config.prefix + config.project_id + ':' + config.region + ':' + config.instance;
            url += database ? '/' + database : '/';
          } else {
            url = config.prefix + config.server + ':' + config.port;
            url += database ? '/' + database : '/';
          }
          break;
        case 'jdbc:google:mysql://':
          url = config.prefix + config.project_id + ':' + config.region + ':' + config.instance;
          url += database ? '/' + database : '/';
          break;
        case 'jdbc:sqlserver://':
          url = config.prefix + config.server + ':' + config.port;
          url += database ? ';databaseName=' + database : '';
          break;
        default:
          throw new Error("Unsupported database type");
      }

      if (config.prefix.indexOf('jdbc:google:mysql://') === 0) {
        this.conn = Jdbc.getCloudSqlConnection(url, config.userName, config.password);
      } else {
        this.conn = Jdbc.getConnection(url, config.userName, config.password);
      }

      this.databaseUrl = url;
      this.currentDb = database;
      return this.conn;
    };



  // ============
  //    BASIC   #
  // ============

    /**
     * Executes a given SQL query on the specified database and returns the resulting
     * `JdbcResultSet` object. The query is executed using a statement created from the
     * database connection.
     *
     * @param {string} sql The SQL statement to execute.
     * @param {string=} [db] __Optional__: The name of the database to connect to.
     * @return {boolean} `true` if the first result is a result set; `false` if it is
     *     an update count or if there are no results.
     */
    JdbcX.prototype._execute = function(sql, db, isServerConnection) {
      var result = false;
      try {
        var stmt = this.getConnection(db, isServerConnection).createStatement();
        var exec = stmt.execute(sql);
        result = true;
      }
      catch (err) {
        this.LogError(err, "Stmt with error:", sql);
      }
      finally {
        if (stmt) stmt.close();
        L("%s execute completed.", this.conn);
      }

      return result;
    }


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
     * const resultSet = conn._executeQuery(sql, 'myDatabase');
     * while (resultSet.next()) {
     *   console.log(resultSet.getString(1)); // Outputs the first column of each row
     * }
     * ```
     *
     * @param {string} sql The SQL statement to execute, typically a static `SELECT`.
     * @param {string=} [db] __Optional__: The name of the database to connect to.
     *
     * @return {JdbcResultSet} A result set containing the results of the execution.
     *     This is never `null`.
     */
    JdbcX.prototype._executeQuery = function(sql, db) {
      try {
        var stmt = this.getConnection(db).createStatement();
        var results = stmt.executeQuery(sql);
        if (this.showLogs) L("The execute Query was completed successfully.");
      }
      catch (err) {
        this.LogError(err, "Stmt with error:", sql);
      }
      finally {
        if (stmt) stmt.close();
        this.LogTime();
      }

      return results;
    };


    /**
     * Executes an SQL update statement (INSERT, UPDATE, DELETE) against the specified database.
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
     *
     * @param {string} sql The SQL update statement to execute.
     * @param {string=} [db] The name of the database to execute the update against.
     *
     * @returns {number} Either (1) the row count for SQL Data Manipulation Language (DML) 
     * statements or (2) 0 for SQL statements that return nothing.
     */
    JdbcX.prototype._executeUpdate = function(sql, db) {
      try {
        var stmt = this.getConnection(db).createStatement();
        var exec = stmt.executeUpdate(sql);
        if (this.showLogs) L("The execute Update was completed successfully.");
      }
      catch(err) {
        this.LogError(err, "Stmt with error:", sql);
      }
      finally {
        if (stmt) stmt.close();
        this.LogTime();
      }

      return exec;
    };



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
     *
     * @param {string} query The SQL query to be executed.
     * @param {string=} [db] __Optional__: The name of the database to connect to.
     *
     * @return {Array<Array<string>>} An array of arrays containing the result set rows
     *     and columns. If an error occurs, an empty array is returned.
     */
    JdbcX.prototype._queryDatabase = function(query, db, isServerConnection) {
      var resultsArray = [];
      try {
        var stmt = this.getConnection(db, isServerConnection).createStatement();
        if (query.toUpperCase().indexOf("SELECT") === 0 || query.toUpperCase().indexOf("SHOW") === 0) {
          var results = stmt.executeQuery(query);
          var numCols = results.getMetaData().getColumnCount();
          while (results.next()) {
              var row = [];
              for (var col = 0; col < numCols; col++) {
                row.push(results.getString(col + 1));
              }
            resultsArray.push(row);
          }
          results.close();
        } else {
          stmt.executeUpdate(query);
          resultsArray.push("Query executed successfully");
        }
      }

      catch (err) {
        this.LogError(err, "Stmt with error:", query);
      }

      finally {
        if (stmt) stmt.close();
        this.LogTime();
      }

      return resultsArray;
    };



  // =============
  //   GET INFO  #
  // =============

    // DATABASES
    /**
     * ### Description
     * Retrieves a list of databases from the connected database server, excluding
     * system databases unless specified otherwise.
     *
     * ### Example
     * ```js
     * const conn = JdbcX.getConnection(config);
     * const databases = conn.getListDatabases(false);
     * console.log(databases); // Outputs: List of databases excluding system databases
     * ```
     *
     * @param {boolean} [includeSystem=false] Optionally include system databases.
     *     Default is `false`.
     * @returns {Array<string>} An array of database names.
     */
    JdbcX.prototype._getListDatabases = function(includeSystem) {

      includeSystem = includeSystem === undefined ? false : includeSystem;
      var query;

      switch (this.config.prefix) {
        case 'jdbc:mysql://':
        case 'jdbc:google:mysql://':
          query = "SHOW DATABASES";
          if (includeSystem !== true) {
            query += " WHERE `database` NOT IN('mysql','information_schema'," +
                     "'performance_schema','sys','logregsys','phpmyadmin')";
          }
          break;
        case 'jdbc:postgresql://':
          // the following lines were generated ChatGPT by OpenAI:
          query = "SELECT datname FROM pg_database";
          if (includeSystem !== true) {
            query += " WHERE datname NOT IN ('template0', 'template1', 'postgres')";
          }
          break;
        case 'jdbc:sqlserver://':
          // the following lines were generated ChatGPT by OpenAI:
          query = "SELECT name FROM sys.databases";
          if (includeSystem !== true) {
            query += " WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')";
          }
          break;
        default:
          throw new Error("Unsupported database type");
      }

      return this._queryDatabase(query, null, true).map(function(row) {
        return row[0];
      });
    };


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
     *
     * @param {string=} [db] __Optional__: The name of the database to retrieve
     *     tables from.
     *
     * @return {Array<string>} An array containing the names of the tables
     *     in the database. If an error occurs or no tables are found, an empty array
     *     is returned.
     */
    JdbcX.prototype._getListTables = function(db) {
      var query;
      switch (this.config.prefix) {
        case 'jdbc:mysql://':
        case 'jdbc:google:mysql://':
          query = "SHOW TABLES";
          break;
        case 'jdbc:postgresql://':
        case 'jdbc:sqlserver://':
          // the following line was generated ChatGPT by OpenAI:
          query = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES " +
                  "WHERE TABLE_TYPE = 'BASE TABLE'";
          break;
        default:
          throw new ValidationError("Unsupported database type");
      }

      return this._queryDatabase(query, db).map(function(row) {
        return row[0];
      });
    };


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
     *
     * @param {string} table The name of the table for which to retrieve columns.
     * @param {string=} [db] __Optional__: The name of the database containing the table.
     *
     * @return {Array<string>} An array containing the names of the columns in the table.
     *     If an error occurs or no columns are found, an empty array is returned.
     */
    JdbcX.prototype._getListColumns = function(table, db) {
      if (!table) throw new ValidationError("Value of the 'table' is not defined.");
      var query;
      switch (this.config.prefix) {
        case 'jdbc:mysql://':
        case 'jdbc:google:mysql://':
          query = "SHOW COLUMNS FROM " + table;
          break;
        case 'jdbc:postgresql://':
          // the following line was generated ChatGPT by OpenAI:
          query = "SELECT column_name FROM information_schema.columns " +
                  "WHERE table_name = '" + table + "'";
          break;
        case 'jdbc:sqlserver://':
          // the following line was generated ChatGPT by OpenAI:
          query = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "+
                  "WHERE TABLE_NAME = '" + table + "'";
          break;
        default:
          throw new ValidationError("Unsupported database type");
      }
      return this._queryDatabase(query, db).map(function(row) {
        return row[0];
      });
    };


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
     *
     * @param {string} table The name of the table for which to retrieve index information.
     * @param {string=} [db] __Optional__: The name of the database containing the table.
     * @param {boolean=} [returnObject=false] __Optional__: Whether to return index
     *     information as objects.
     *
     * @return {Array<Array<string>>|Array<Object>} If returnObject is true, an array of
     *     objects containing index details is returned. If false or not specified, an
     *     array of arrays containing raw index data is returned. If an error occurs or
     *     no index information is found, an empty array is returned.
     */
    JdbcX.prototype._getIndexInfo = function(table, db, returnObject) {
      if (!table) throw new ValidationError("Table parameter is required.");
      if (this.config.prefix !== 'jdbc:google:mysql://' && 
          this.config.prefix !== 'jdbc:mysql://') {
        throw new ValidationError("Unsupported database type");
      }

      var query = "SHOW INDEX FROM " + table;
      var qresult = this._queryDatabase(query, db);

      if (returnObject) {
        return qresult.map(function(row) {
          return {
            table: row[0],
            nonUnique: row[1],
            keyName: row[2],
            seqInIndex: row[3],
            columnName: row[4],
            collation: row[5],
            cardinality: row[6],
            subPart: row[7],
            packed: row[8],
            nullable: row[9],
            indexType: row[10],
            comment: row[11],
            indexComment: row[12]
          };
        });
      } else {
        return qresult;
      }
    };


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
     *
     * @param {boolean=} [returnObject=false] __Optional__: Whether to return variables
     *     and their values as an object.
     *
     * @return {Array<Array<string>>|Object} If returnObject is `true`, an object
     *     with variable names as keys and their corresponding values is returned.
     *     If `false` or not specified, an array with variable names and values is
     *     returned.
     */
    JdbcX.prototype._getVariables = function(returnObject) {
      var query;
      switch (this.config.prefix) {
        case 'jdbc:mysql://':
        case 'jdbc:google:mysql://':
          query = "SHOW VARIABLES";
          break;
        case 'jdbc:postgresql://':
          // the following line was generated ChatGPT by OpenAI:
          query = "SELECT name, setting FROM pg_settings";
          break;
        case 'jdbc:sqlserver://':
          // the following line was generated ChatGPT by OpenAI:
          query = "SELECT name, value_in_use FROM sys.configurations";
          break;
        default:
          throw new ValidationError("Unsupported database type");
      }
      var qresult = this._queryDatabase(query, null);
      
      if (returnObject) {
        return qresult.reduce(function(acc, row) {
          acc[row[0]] = row[1];
          return acc;
        }, {});
      } else {
        return qresult;
      }
    };


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
     *
     * @param {string} user The name of the user for which to retrieve grants.
     *
     * @return {Array<Array<string>>} An array containing the grants assigned to the user.
     *     If an error occurs or no grants are found, an empty array is returned.
     */
    JdbcX.prototype._getUserGrants = function(user) {
      if (!user) throw new ValidationError("User parameter is required.");
      var query;
      switch (this.config.prefix) {
        case 'jdbc:mysql://':
        case 'jdbc:google:mysql://':
          if (this.config.progect_id) {
            // the following line was generated ChatGPT by OpenAI:
            query = "SELECT * FROM mysql.user WHERE User = '" + user + "'";
          } else {
            query = "SHOW GRANTS FOR '" + user + "'";
          }
          break;
        case 'jdbc:postgresql://':
          // the following line was generated ChatGPT by OpenAI:
          query = "SELECT grantee, table_catalog, table_schema, table_name, privilege_type " +
                  "FROM information_schema.role_table_grants " +
                  "WHERE grantee = '" + user + "'";
          break;
        case 'jdbc:sqlserver://':
          // the following line was generated ChatGPT by OpenAI:
          query = "SELECT * FROM sys.database_permissions WHERE " +
                  "grantee_principal_id = USER_ID('" + user + "')";
          break;
        default:
          throw new ValidationError("Unsupported database type");
      }

      return this._queryDatabase(query, null);
    };


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
     *
     * @param {boolean=} [returnObject=false] __Optional__: Whether to return status
     *     variables and their values as an object.
     *
     * @return {Array<Array<string>>|Object} If returnObject is true, an object containing
     *     server status variables as keys and their corresponding values is returned.
     *     If false or not specified, an array of arrays containing status variable names
     *     and values is returned. If an error occurs or no status variables are found,
     *     an empty array or object is returned.
     */
    JdbcX.prototype._getStatus = function(returnObject) {
      var query = "SHOW STATUS";
      var qresult = this._queryDatabase(query, null);

      if (returnObject) {
        return qresult.reduce(function(acc, row) {
          acc[row[0]] = row[1];
          return acc;
        }, {});
      } else {
        return qresult;
      }
    };


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
     *
     * @param {boolean=} [returnObject=false] __Optional__: Whether to return process
     *     list information as objects.
     *
     * @return {Array<Array<string>>|Array<Object>} If returnObject is true, an array
     *     of objects containing process details is returned. If false or not specified,
     *     an array of arrays containing raw process data is returned.
     *     If an error occurs or no processes are found, an empty array is returned.
     */
    JdbcX.prototype._getProcessListMySQL = function(returnObject) {
      if (this.config.prefix !== 'jdbc:google:mysql://' &&
          this.config.prefix !== 'jdbc:mysql://') {
        throw new ValidationError("Unsupported database type");
      }
      var query = "SHOW PROCESSLIST";
      var qresult = this._queryDatabase(query, null);
      if (returnObject) {
        return qresult.map(function(row) {
          return {
            id: row[0],
            user: row[1],
            host: row[2],
            db: row[3],
            command: row[4],
            time: row[5],
            state: row[6],
            info: row[7]
          };
        });
      } else {
        return qresult;
      }
    };


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
     *
     * @return {Array<string>} An array containing the names of users in the database.
     *     If an error occurs or no users are found, an empty array is returned.
     */
    JdbcX.prototype._getUserList = function() {
      var query;
      switch (this.config.prefix) {
        case 'jdbc:mysql://':
        case 'jdbc:google:mysql://':
          query = "SELECT user FROM mysql.user";
          break;
        case 'jdbc:postgresql://':
          // the following line was generated ChatGPT by OpenAI:
          query = "SELECT usename FROM pg_user";
          break;
        case 'jdbc:sqlserver://':
          // the following line was generated ChatGPT by OpenAI:
          query = "SELECT name FROM sys.server_principals WHERE type_desc = 'SQL_LOGIN'";
          break;
        default:
          throw new ValidationError("Unsupported database type");
      }

      return this._queryDatabase(query, null);
    };


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
     *
     * @param {string} sql The SQL statement to execute for counting records.
     * @param {string=} [db] __Optional__: The name of the database to connect to.
     *
     * @return {number} The count of records matching the criteria.
     *     Returns `0` if no records match.
     * @throws {ValidationError} Throws an error if the SQL statement
     *     is not defined or does not contain a valid `SELECT` clause.
     */
    JdbcX.prototype._getRowCount = function(sql, db) {
      if (!sql) throw new ValidationError(
        "The 'sql' parameter is not defined.");
      var regex = /SELECT[\s\S]*?FROM/i;
      if (regex.test(sql)) {
        sql.replace(regex, 'SELECT COUNT(*) AS count FROM');
      } else {
        throw new ValidationError(
          "The 'sql' parameter must contain a valid 'SELECT ... FROM' clause.");
      }

      var count = 0;

      try {
        var stmt = this.getConnection(db).prepareStatement(sql);
        var rs = stmt.executeQuery();
        if (rs.next()) count = rs.getInt('count');
        if (this.showLogs) L("The query executed successfully.", sql);
      }
      catch (err) {
        this.LogError(err, "Error executing query:", sql);
      }
      finally {
        if (rs) rs.close();
        if (stmt) stmt.close();
        this.LogTime();
      }

      return count;
    };


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
     *
     * @param {string} table The name of the database table to query.
     * @param {queryFilter|queryFilter[]=} [filter] The filter object or array
     *     of objects to apply to the query, which can contain properties such as
     *     `column`, `value`, `value_from`, `value_to`, `toUnixTime`, `sort`,
     *     `direction`, `limit`, `offset` and other. See: queryFilter spec.
     * @param {string=} [db] __Optional__: The name of the database to connect to.
     * @return {number} The count of records matching the criteria.
     *     Returns `0` if no records match.
     * @throws {ValidationError} Throws an error if the table name
     *     is not defined.
     */
    JdbcX.prototype._getRowCountByFilter = function(table, filter, db) {
      if (!table) throw new ValidationError(
        "The 'table' parameter is not defined.");
      if (!filter) filter = {};
      var sql = generateQuery(this.config.prefix, table, '', filter, true);
      return this._getRowCount(sql, db);
    };



  // =============
  //    CREATE   #
  // =============

    /**
     * Creates a new database if it does not already exist.
     *
     * ### Example
     * ```js
     * var conn = JdbcX.getConnection(config);
     * var dbName = "newDatabase";
     * var result = conn.createDatabase(dbName);
     * console.log(result); // Outputs: the result of the CREATE DATABASE statement
     * ```
     *
     * @param {string} db The name of the database to create.
     *
     * @throws {Error} If the `db` parameter is not provided.
     *
     * @returns {any} The result of the `CREATE DATABASE` SQL statement.
     */
    JdbcX.prototype._createDatabase = function(db) {
      if (!db) throw new ValidationError("DB parameter is required.");
      LW('Please ensure you have the necessary permissions to create the database.');
      return this._execute('CREATE DATABASE IF NOT EXISTS ' + db, null, true);
    };


    /**
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
     *
     * @param {string} table The name of the database table to insert data into.
     * @param {Array<string>} columns An array of column names to insert data into.
     * @param {Array<any>} values An array of values to insert corresponding to the columns.
     * @param {string=} [db] Optional: The name of the database to connect to.
     *
     * @returns {number} The row count for SQL Data Manipulation Language (DML) statements (1).
     */
    JdbcX.prototype._insertInto = function(table, columns, values, db) {
      if (!table) throw new ValidationError("Table parameter is required.");

      if (!Array.isArray(columns) || columns.length === 0)
        throw new ValidationError("columns parameter must be a non-empty array.");

      if (!Array.isArray(values) || values.length === 0)
        throw new ValidationError("values parameter must be a non-empty array.");

      if (columns.length !== values.length)
        throw new ValidationError("columns and values must have the same length.");

      var sqlColumns = columns.map(function(col) {
        return '`' + col + '`';
      }).join(', ');

      var sqlValues = values.map(function(v) {
        if (typeof v === 'string') {
          return "'" + v.replace(/'/g, "''") + "'";
        }
        return v;
      }).join(', ');

      // Создание SQL запроса
      var sql = 'INSERT INTO `' + table + '` (' + sqlColumns + 
                ') VALUES (' + sqlValues + ')';

      return this._executeUpdate(sql, db);
    };


  // =============
  //    DELETE   #
  // =============

    /**
     * Deletes a specified table from a database.
     *
     * ### Example
     * ```js
     * var conn = JdbcX.getConnection(config);
     * var tableName = "oldTable";
     * var result = conn._deleteTable(tableName);
     * console.log(result); // Outputs: true if the table was successfully deleted, otherwise false
     * ```
     *
     * @param {string} table The name of the table to delete.
     * @param {string=} [db] The name of the database to connect to.
     *     If not provided, the default database is used.
     *
     * @throws {ValidationError} If the `table` parameter is not provided.
     *
     * @returns {boolean} `true` if the table was successfully deleted, otherwise `false`.
     */
    JdbcX.prototype._deleteTable = function(table, db) {
      if (!table) throw new ValidationError("Table parameter is required.");
      db = db || this.defaultDb;
      return this._execute("DROP TABLE `" + db + "`.`" + table + "`", db);
    };



  // ===============
  //    EXTENDED   #
  // ===============
  //    Read       #
  // ===============


    // renaming: getDataFromCloudDB --> getDataFromMySQL --> retrieveDataFromDB
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
     *
     * @param {string} table The name of the database table to query.
     * @param {string|Array<string>} columns The columns to retrieve, either as a comma-
     *     separated string or an array of strings.
     * @param {number=} [returnType=0] The return type:
     *     0 - Returns data as an array of nested objects, where each object represents a row.
     *     1 - Returns data as an object with arrays, where each array represents a column.
     * @param {queryFilter|queryFilter[]=} [filter] The filter object or array
     *     of objects to apply to the query, which can contain properties such as
     *     `column`, `value`, `value_from`, `value_to`, `toUnixTime`, `sort`,
     *     `direction`, `limit`, `offset` and other. See: queryFilter spec.
     * @param {string=} [db] The name of the database to query.
     *
     * @return {Array<Object>|Object} The data retrieved from the database, either as an
     *     array of arrays or an array of objects based on the return type.
     */
    JdbcX.prototype._retrieveDataFromDB = function(table, columns, returnType, filter, db) {

        returnType = !returnType ? 0 : returnType;

      // Type checking 
        if (!table) throw new ValidationError("The 'table' must be a specific value.");

        if (typeof columns !== 'string') {
          if (!Array.isArray(columns) ||
              !columns.every(function(col) { return typeof col === 'string'; })) {
            throw new ValidationError("The 'columns' must be an array of strings.");
          }
        }

        if (typeof filter !== 'object' || Array.isArray(filter)) {
          throw new ValidationError("The 'filter' must be an object.");
        }

      // Query generator - JX_QueryGenerator
        var sql_query = generateQuery(this.config.prefix, table, columns, filter);
        if (this.showLogs) console.log("stmt:", sql_query);

      // Taking result 
        if (returnType === 1) {
          return this._getTableAsArray(sql_query, columns, db);
        } else {
          return this._getTableAsObject(sql_query, columns, db);
        }
    };


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
     *
     * @param {string} sql_query The SQL query to be executed.
     * @param {Array<string>} columns The columns to retrieve, used for validation and
     *     restructuring the query in case of errors.
     * @param {string} db The name of the database to query.
     * @param {number} [error_counter=0] The counter for tracking retry attempts due to
     *     errors in the query. Defaults to 0.
     *
     * @return {Array<Object>} An array of objects, where each object represents a row of
     *     data with key-value pairs for column names and their corresponding values.
     *     If an error occurs beyond the allowed retries, an empty array is returned.
     */
    JdbcX.prototype._getTableAsObject = function(sql_query, columns, db, error_counter) {
      
      error_counter = !error_counter ? 0 : error_counter;

      try {
        var stmt = this.getConnection(db).createStatement();
        var results = stmt.executeQuery(sql_query);
        var numCols = results.getMetaData().getColumnCount();
        var resultsArray = [];

        while (results.next()) {
            var rowObj = {};
            for (var col = 0; col < numCols; col++) {
              var columnName = results.getMetaData().getColumnName(col + 1);
              var columnValue = results.getString(col + 1);
              rowObj[columnName] = columnValue;
            }
          resultsArray.push(rowObj);
        }
        results.close();
      }
      catch (err) {
        console.log('Failed with an error %s', err.message);
        if (err.message.indexOf('Unknown column') !== -1) {
          error_counter += 1;
          var wrong_col = err.message.match(/Unknown column '(.*?)'/)[1];
          sql_query = trimQuery(sql_query, wrong_col);
          L("SQL_QUERY CHANGED TO:", sql_query);
          if (error_counter > 5) {
            return [];
          } else {
            return this._getTableAsObject(sql_query, columns, db, error_counter);
          }
        } else {
          return [];
        }
      }
      finally {
        if (this.showLogs) L("close", error_counter);
        if (stmt) stmt.close();
        this.LogTime();
      }

      return resultsArray;
    };


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
     * @param {string} sql_query The SQL query to be executed.
     * @param {Array<string>} columns The columns to retrieve, used for validation and
     *     restructuring the query in case of errors.
     * @param {string} db The name of the database to query.
     * @param {number} [error_counter=0] The counter for tracking retry attempts due to
     *     errors in the query. Defaults to 0.
     *
     * @return {Object} An object containing the results of the query with the following
     *     properties:
     *     - `columns`: An array of column names.
     *     - `data`: An array of arrays, where each inner array represents a row of data.
     *     - `items`: The number of rows retrieved.
     *     If an error occurs beyond the allowed retries, an empty object is returned.
     */
    JdbcX.prototype._getTableAsArray = function(sql_query, columns, db, error_counter) {

      error_counter = !error_counter ? 0 : error_counter;

      try {
        var stmt = this.getConnection(db).createStatement();
        const results = stmt.executeQuery(sql_query);
        const numCols = results.getMetaData().getColumnCount();
        var columnsArray = [];
        var resultsArray = [];

        // push column header to array
        for (var col = 0; col < numCols; col++) {
          columnsArray.push(results.getMetaData().getColumnName(col + 1));
        }

        // push data to array
        while (results.next()) {
          var rowArray = [];
          for (var col = 0; col < numCols; col++) {
            rowArray.push(results.getString(col + 1));
          }
          resultsArray.push(rowArray);
        }
        results.close();

        var result = {
          columns: columnsArray,
          data: resultsArray,
          items: resultsArray.length
        };
      }
      catch (err) {
        console.log('Failed with an error %s', err.message);
        if (err.message.indexOf('Unknown column') !== -1) {
          error_counter += 1;
          var wrong_col = err.message.match(/Unknown column '(.*?)'/)[1];
          sql_query = trimQuery(sql_query, wrong_col);
          L("SQL_QUERY CHANGED TO:", sql_query);
          if (error_counter > 5) {
            return {};
          } else {
            return this._getTableAsArray(sql_query, columns, db, error_counter);
          }
        } else {
          return {};
        }
      }
      finally {
        if (this.showLogs) L("close", error_counter);
        if (stmt) stmt.close();
        this.LogTime();
      }

      return result;
    };


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
     *
     * @param {string} table The name of the database table to insert data into.
     * @param {Array<string>} columns An array containing the column headers of the table.
     * @param {Array<Array<any>>} data An array of arrays representing the data to be inserted.
     * @param {insertOptions=} [options] Additional options for customizing the insert operation:
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
    JdbcX.prototype._insertArrayToDBTable = function(table, columns, data, options) {

      if (this.showLogs) console.log('Inserting an Array into a Database Table.');

      function SetValue(stmt, index, value, type) {
        if (typeAsString(type)) {
          if (type === 'object' || type === 'array') {
            stmt.setString(index, JSON.stringify(value));
          } else {
            stmt.setString(index, String(value));
          }
        } else {
          switch (type) {
            case 'boolean':
              stmt.setBoolean(index, value);
              break;
            case 'integer':
              stmt.setInt(index, value);
              break;
            case 'double':
              stmt.setDouble(index, value);
              break;
            case 'string':
              stmt.setString(index, value);
              break;
            case 'date':
              try {
                // value = new Date(value);
                stmt.setTimestamp(index, dateTimeFormat(value, 'jdbc'));
              } catch (e) {
                stmt.setString(index, dateTimeFormat(value, 'yyyy-MM-dd HH:mm:ss'));
              }
              break;
            case 'blob':
              stmt.setBytes(index, value.getBytes());
              break;
            case 'array':
            case 'object':
              try {
                stmt.setObject(index, JSON.stringify(value));
              } catch (e) {
                stmt.setString(index, JSON.stringify(value));
              }
              break;
            case 'undefined':
            case 'null':
            case 'none':
              stmt.setNull(index, java_.sql.Types.NULL);
              break;
            default:
              stmt.setString(index, String(value));
          }
        }
      }

      function LogSQLRow_(q, v, l_) {
        if (!l_) return;
        var fq = q;
        for (var i = 0; i < v.length; i++) {
          var vt = v[i];
          var fv = (vt === null)
              ? 'NULL'
              : (typeof vt === 'string')
                  ? "'" + vt + "'"
                  : vt;
          fq = fq.replace('?', fv);
        }
        L(fq);
      }

      options = options || {};
      var detectTypes = options.detectTypes !== false;
      var stringTypes = options.stringTypes || []; // 'integer', 'double', 'object', 'array', 'boolean'
      var typeAsString = function(type) {
          return stringTypes.indexOf(type) !== -1;
      };
      var db = options.db;
      var autoCommit = options.autoCommit || false;
      var batchSize = options.batchSize || 100;
      var updateDuplicates = options.updateDupls || options.updateDuplicates || false;
      var conn, stmt, result, isAsync = false;

      var headerString = columns.map(function(col) {
        return '`' + col + '`';
      }).join(', ');

      var placeholders = columns.map(function() {
        return '?';
      }).join(', ');

      var insertQuery = "INSERT INTO `" + table + "` (" + headerString + 
                        ") VALUES (" + placeholders + ")";

      if (updateDuplicates) {
        var updateFields = columns.map(function(field) {
          return "`" + field + "` = VALUES(`" + field + "`)";
        }).join(', ');
        insertQuery += " ON DUPLICATE KEY UPDATE " + updateFields;
      }

      if (data && data.hasOwnProperty('Async')) {
        data = data.Async;
        isAsync = true;
      }

      try {
        conn = this.getConnection(db);
        conn.setAutoCommit(autoCommit);

        stmt = conn.prepareStatement(insertQuery);
        
        if (data.length >= 20 && this.showLogs) {
          L("Logs for each row are disabled because"+
            "there are more than 20 rows of data.");
        }

        for (var i = 0; i < data.length; i++) {
          var rowData = data[i];

          for (var j = 0; j < columns.length; j++) {
            
            var value;
            var metaType;

            if (isAsync) {
              if (rowData[j] !== undefined && rowData[j] !== "") {
                metaType = rowData[j].metaType;
                value = rowData[j].value;
              } else {
                metaType = 'null';
                value = null;
              }
            } else {
              value = (rowData[j] !== undefined && rowData[j] !== "")
                ? rowData[j]
                : null;
            }

            if (isAsync) {
              if (metaType === 'blob') {
                value = Utilities.newBlob(value);
              } else if (metaType === 'date') {
                // metaType = "string";
                value = dateTimeFormat(value, 'date');
              }
            }

            if (detectTypes) {
              var valueType = isAsync ? metaType : getTypeOf_(value);
              SetValue(stmt, j + 1, value, valueType);
            } else {
              if (value === null) {
                stmt.setNull(j + 1, java_.sql.Types.NULL);
              } else {
                stmt.setString(j + 1, value);
              }
            }

          }
          if (data.length < 20) {
            LogSQLRow_(insertQuery, data[i], this.showLogs);
          }
          stmt.addBatch();

          if (autoCommit && (i + 1) % batchSize === 0) {
            stmt.executeBatch();
          }
        }

        stmt.executeBatch();
        if (!autoCommit) conn.commit();

        result = true;
      }
      catch (err) {
        if (!autoCommit && conn) {
          if (this.showLogs) L("Operation failed. Rolling back changes.");
          conn.rollback();
        }
        try {
          var smtd = stmt.getParameterMetaData();
          var metaData = stmt.toString() + " count: " + smtd.getParameterCount();
        } catch (e) {
          var metaData = 'Connection error.';
        }
        var v_ = typeof value === 'object' ? JSON.stringify(value) : value;
        var errorMessage = "Error with column index: " + j + ", row index: " + i + ". " +
                           "Last value is: '" + v_ + "'. Value type: '" + typeof value +
                           "'.\n" + metaData;
        if (err.message.indexOf('Duplicate entry') == -1) LE(errorMessage);
        this.LogError(err, errorMessage);
      }
      finally {
        if (stmt) stmt.close();
        if (conn) conn.close();
        this.LogTime();
      }

      return result;
    };



  // =================
  //   DO POST TASK  #
  // =================

    /**
     * Executes multiple tasks by sending POST requests to the script web app URL.
     * Each request contains the function name, arguments, and context needed to
     * execute the task. The function returns the responses from all the tasks.
     *
     * @param {Array<Object>} p_ An array of task objects, each containing
     *     the function name, tag, and arguments.
     *
     * @return {Array<Object>} An array of responses from the web application.
     */
    JdbcX.prototype._DoMany = function(p_) {
      var err, reqs, res;
      try {
        reqs = p_.map((function(_this) {
          return function(e) {
            delete _this.METHODS;
            var obj;
            obj = {
              muteHttpExceptions: true,
              url: _this.webAppURL,
              method: "POST",
              contentType: "application/json",
              payload: JSON.stringify({
                "function": e.functionName,
                "tag": e.tag,
                "arguments": e.arguments || [],
                "context": _this
              })
            };
            if (_this.accessToken) {
              obj.headers = {
                Authorization: "Bearer " + _this.accessToken
              };
            }
            return obj;
          };
        })(this));
        res = UrlFetchApp.fetchAll(reqs);
      } catch (error) {
        err = error;
        throw new Error(err);
      } finally {
        this.LogTime();
      }
      return res;
    };


    /**
     * Executes a single task by sending a POST request to the script web app URL.
     * The request contains the function name, arguments, and context needed to
     * execute the task. The function returns the result or error from the task.
     *
     * @param {Object} p_ An object containing the function name, tag, and
     *     arguments for the task.
     *
     * @return {Object} The result or error from the executed task.
     */
    JdbcX.prototype.DoOneTask = function(p_) {
      var req, data, result;
      try {
        req = {
          muteHttpExceptions: true,
          method: "POST",
          contentType: "application/json",
          payload: JSON.stringify({
            "function": p_.functionName,
            "arguments": p_["arguments"],
            "tag": p_["tag"],
            "context": Object.assign({}, {config: this.config})
          }),
          headers: {
            Authorization: "Bearer " + this.accessToken
          }
        };
        data = UrlFetchApp.fetch(this.webAppURL, req);
        data = JSON.parse(data.getContentText());

        result = data.hasOwnProperty('Result') ? data.Result : null;

        if (data && data.Error) {
          if (!this.muteError) {
            throw new Error(data.Error);
          } else {
            LE(data.Error);
          }
        }
      } catch (e) {
        throw new Error(e.message);
      } finally {
        this.LogTime();
      }
      return result;
    };


    /**
     * ### Description
     * Executes a specified function from a provided object with given arguments and
     * returns the result. The function to be executed, its arguments, and a tag are
     * extracted from the JSON payload of the request. The results, including any
     * errors, are returned as a JSON string.
     *
     * ### Example
     * ```js
     * var t_ = {
     *   myFunction: function(args) {
     *     // Function implementation
     *     return 'Hello, ' + args[0] + '!';
     *   }
     * };
     * var e_ = {
     *   postData: {
     *     contents: JSON.stringify({
     *       "function": "myFunction",
     *       "arguments": [["world"]],
     *       "tag": "greeting"
     *     })
     *   }
     * };
     * var result = JdbcX.prototype.RunTasks(t_, e_);
     * console.log(result.getContent()); // Outputs: {"FunctionName":"myFunction","Arguments":["world"],"Tag":"greeting","Result":"Hello, world!"}
     * ```
     *
     * @param {Object} t_ An object (`this`) containing the functions to be executed.
     * @param {Object} e_ The event object containing the POST data with the function
     *     name (string), arguments (array of args), and tag (any).
     *
     * @return {ContentService.TextOutput} A JSON string encapsulated in a TextOutput
     *     object, containing the function name, arguments, tag, result,
     *     and any errors that occurred.
     */
    JdbcX.prototype.RunTasks = function(t_, e_) {
      var a, f, ta, obj, result;
      obj = JSON.parse(e_.postData.contents);
      f = obj["function"] || null;
      a = "arguments" in obj ? obj["arguments"] : null;
      ta = "tag" in obj ? obj["tag"] : null;
      result = {};
      if (f) {
        if (f in t_ && typeof t_[f] === "function") {
          result.FunctionName = f;
          result.Arguments = a;
          result.Tag = ta;
          // result.Result = t_[f](a);
          try {
            result.Result = t_[f].apply(t_, a);
          } catch(error) {
            result.Error = error.message || error;
          }
        } else {
          result.Error = "Function of '" + f + "' was not found.";
        }
      } else {
        result.Error = "Function name was not given.";
      }
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    };



  // =========
  //   LOGS  #
  // =========

    /** @private */
    JdbcX.prototype.LogTime = function(msg) {
      if (this.showTime) {
        var executionTime = new Date().getTime() - st_1;
        var message = msg
              ? "Execution time for " + msg
              : "Execution time";
        message += " is %sms";
        L(message, executionTime);
        st_1 = new Date().getTime();
      }
    };


    /** @private */
    JdbcX.prototype.LogError = function(error) {
      if (this.showLogs && arguments.length > 1) {
        var caller = '';
        try {
          var stack = error.stack || (new Error()).stack;
          var stact = stack.split('\n').filter(function(line) {
            return line.trim() !== '';
          });
          caller = stact[stact.length - 1].trim().match(/at (\S+)/)[1];
        } catch (e) {
          caller = '';
        }
        LE("[ERROR " + caller + "] ", Array.prototype.slice.call(arguments, 1));
      }

      if (this.muteError === false) {
        throw new SQLError(error);
      } else {
        LE('Failed with an error: %s', error.message);
      }
    };


    var st_1 = new Date().getTime();
    return JdbcX;
  })();

  return r.JdbcX = JdbcX;
})(this);

