# JDBCX

<a name="top"></a>
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

<a name="overview"></a>

# Overview

**This library and WebApp enhance the capabilities of the standard Jdbc service for faster and more efficient query processing.**

<a name="description"></a>

# Description

JdbcX is a practical solution that combines a library and a WebApp to expand the functionality of the standard Google Apps Script Jdbc service. It accelerates query processing and supports asynchronous execution.
The library application functionality has been tested with MySQL databases, with experimental support for PostgreSQL and SQL Server.

# Library's project key

```
1AMYNAA96kZTenVVNqjDXtyZx7h6PcQHIbFvnt1TxqbHIuqBbLbmMQk7l
```

<a name="howtoinstall"></a>

# How to Install

To use the asynchronous functions, you need to deploy the library application in your environment. Skip this step if you do not need asynchronous and multi-threaded processing support.

## Deployment

<a name="deploy"></a>

1. **Create a new Apps Script project** and copy the following JSON into the **appsscript.json** file:
> Enable the display of **appsscript.json** in the project settings to view the file.

```json
{
  "timeZone": "Europe/Moscow",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Drive",
        "serviceId": "drive",
        "version": "v3"
      }
    ],
    "libraries": [
      {
        "userSymbol": "ScriptSync",
        "version": "6",
        "libraryId": "1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL",
        "developmentMode": false
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```
<br/>

2. Create a new file named `deploy` in it, then copy the [following code](user/deploy.gs):

```javascript
function deployJDBCXLibrary() {

  // Library & WebApp JdbcX script as a template
  const template_script_id = "1AMYNAA96kZTenVVNqjDXtyZx7h6PcQHIbFvnt1TxqbHIuqBbLbmMQk7l";

  // Initialize the template script
  const updater = ScriptSync.assignTemplate(template_script_id);

  // Copy new files
  const filesToCopy = ScriptSync.getScriptFiles(template_script_id);

  filesToCopy.forEach(function(item) {
    updater.AddNewFile(item.file);
  });

  // Delete this file
  updater.deleteFile('deploy');

  // Apply changes
  const status = updater.commit();

  if (!status) {
    console.error('Something went wrong.');
  } else {
    console.log(
      'Please rename the project to \"JdbcX\". ' +
      'Reload the current tab, change the timezone ' +
      'in the project settings, and follow step 4: ' +
      'https://github.com/githnow/JdbcX#step4.');
  }
}
```

3. Save the project and run `deployJDBCXLibrary()`.

<a name="step4"></a>

4. After a successful run, refresh the project tab and **set the project timezone** in the project settings.

5. Deploy the project simultaneously as both a Library and a WebApp.

<br/>

**You can use the deployment IDs obtained in your working project in the following steps.**

<br/>

> IMPORTANT: Do not modify or alter the source code of the library files unless you are sure of what you are doing.
> 
> This can affect the speed of query submission and processing.

## Installation

<a name="install"></a>

In order to use this library, please install this library or use your own library identifier.

1. [Install library](https://developers.google.com/apps-script/guides/libraries).
   - Library's project key is **`1AMYNAA96kZTenVVNqjDXtyZx7h6PcQHIbFvnt1TxqbHIuqBbLbmMQk7l`**.
1. Copy the following files to your project:
   - To enable autocompletion support - [types](user/types.gs) file.
   - To set up properties of the library script in your own deployment (library), use the - [how_to_use](user/how_to_use.gs) file or the code below.

### Setting Up Library Properties
```javascript
  const password = "new_password";
  const jx_app_url = "webapp_url";
  JdbcX.setJXAppPassword(null, password);
  JdbcX.setJXAppURL(jx_app_url, password);
```

## About scopes

About the install of scopes using the library, this library requires installing scopes into the project that installed the library:
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/sqlservice`
- `https://www.googleapis.com/auth/script.external_request`
- `https://www.googleapis.com/auth/script.scriptapp`

> IMPORTANT: Above 4 scopes are installed in this library. If you want to use other scopes, please install them accordingly using [Manifests](https://developers.google.com/apps-script/concepts/manifests) to the project installed this library.

# Usage Overview

The main function for initializing the connection:

`JdbcX.getConnection(config)`

where `config` is a configuration object with the following options:

```javascript
/** @type {JX_Config} */
const config = {
    prefix: "jdbc:mysql://",
    server: "127.0.0.1",
    port: 3306,
    db: "default_db",
    userName: "user",
    password: "password"
};
```

## Example Usage
```javascript
// Initialize connection with the configuration object
const connection = JdbcX.getConnection(config);

// Use the connection for your database operations
// Example: Running a query
const result = connection.execute('SELECT * FROM example_table');
```

<a name="config"></a>

# About Config

| Parameter           | Description                                                      | Required/Optional | Default Value |
| :------------------ | :--------------------------------------------------------------- | :---------------- | :------------ |
| `prefix`            | The prefix for the JDBC connection URL.                          | Required          | N/A           |
| `server`            | The server address for the database connection.                  | Required          | N/A           |
| `port`              | The port number for the database connection.                     | Required          | N/A           |
| `db`                | The name of the database to connect to.                          | Required          | N/A           |
| `userName`          | The username for the database connection.                        | Required          | N/A           |
| `password`          | The password for the database connection.                        | Required          | N/A           |
| `showTime`          | Indicates whether to display execution time logs.                | Optional          | true          |
| `showLogs`          | Indicates whether to display detailed logs.                      | Optional          | false         |
| `muteSQLExceptions` | Indicates whether to mute SQL exceptions.                        | Optional          | false         |
| `project_id`        | The Google Cloud project ID.                                     | Optional          | N/A           |
| `region`            | The region for the Google Cloud SQL instance.                    | Optional          | N/A           |
| `instance`          | The name of the Google Cloud SQL instance.                       | Optional          | N/A           |

# Methods

<a name="methods"></a>

## Library

| Method                                       | Description                                                                                                                                       |
| :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **getConnection**                            | Initializes the class and establishes a new database connection using the provided configuration settings.                                        |
| **Properties**                                                                                                                                                                                   |
| setJXAppURL                                  | Sets the WebApps URL for accessing this instance.                                                                                                 |
| setJXAppPassword                             | Sets the password for the JdbcX application.                                                                                                      |
| **Tools**                                                                                                                                                                                        |
| generateQuery                                | Generates a SQL query tailored for different database types (MySQL, PostgreSQL, SQL Server). Uses nested functions to construct an SQL query.     |
| dateTimeFormat                               | Converts any date format to a specified format, including Unix timestamp, with optional time truncation or extension.                             |

<a name="methods_class"></a>

## Library Class

| Method                                       | Description                                                                                                                                       |
| :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| getConnection                                | Initializes the class and establishes a new database connection using the provided configuration settings.                                        |
| **General**                                                                                                                                                                                      |
| execute                                      | Executes a SQL statement on the database connection.                                                                                              |
| executeQuery                                 | Executes a SQL query and returns the result set.                                                                                                  |
| executeUpdate                                | Executes a SQL update and returns the number of affected rows.                                                                                    |
| queryDatabase                                | Executes a SQL query and returns results as an array of arrays.                                                                                   |
| createDatabase                               | Creates a new database with the specified name.                                                                                                   |
| deleteTable                                  | Deletes the specified table from the database.                                                                                                    |
| insertInto                                   | Inserts a record into the specified table using an SQL INSERT query.                                                                              |
| insertArrayToDBTable                         | Inserts an array of data into the specified table.                                                                                                |
| retrieveDataFromDB                           | Retrieves data from the specified database table based on columns, return type, and filter criteria.                                              |
| getTableAsArray                              | Executes a query and returns results as an array with column headers and rows of data.                                                            |
| getTableAsObject                             | Executes a query and returns results as an array of objects with key-value pairs for each row.                                                    |
| **Get info**                                                                                                                                                                                     |
| getIndexInfo                                 | Retrieves index information from the specified table.                                                                                             |
| getListDatabases                             | Retrieves a list of all databases from the server.                                                                                                |
| getListTables                                | Retrieves a list of all tables from the specified database.                                                                                       |
| getListColumns                               | Retrieves a list of columns from the specified table.                                                                                             |
| getProcessListMySQL                          | Retrieves a list of processes running on a MySQL server.                                                                                          |
| getStatus                                    | Retrieves the status of the database.                                                                                                             |
| getUserGrants                                | Retrieves user grants from the database.                                                                                                          |
| getUserList                                  | Retrieves a list of users from the database.                                                                                                      |
| getVariables                                 | Retrieves variables from the database.                                                                                                            |
| **Async**                                    |                                                                                                                                                   |
| AsyncDoMany                                  | Executes multiple asynchronous tasks and returns an iterator. Each task is defined by the function and its arguments.                             |
| executeAsync                                 | Asynchronously executes a SQL statement on the specified database.                                                                                |
| executeQueryAsync                            | Asynchronously executes a SQL query and returns the result set.                                                                                   |
| executeUpdateAsync                           | Asynchronously executes a SQL update and returns the number of affected rows.                                                                     |
| queryDatabaseAsync                           | Asynchronously executes a SQL query and returns results as an array of arrays.                                                                    |
| insertIntoAsync                              | Asynchronously inserts a record into the specified table.                                                                                         |
| insertArrayToDBTableAsync                    | Asynchronously inserts an array of data into the specified table.                                                                                 |
| retrieveDataFromDBAsync                      | Asynchronously retrieves data from the specified table based on columns, return type, and filter criteria.                                        |
| getTableAsArrayAsync                         | Asynchronously executes a query and returns results as an array with column headers and rows of data.                                             |
| getTableAsObjectAsync                        | Asynchronously executes a query and returns results as an array of objects.                                                                       |

<a name="usage"></a>

# Usage

The main function for initializing the connection:

```javascript
/** @type {JX_Config} */
const config = {
    prefix: "jdbc:mysql://",
    server: "127.0.0.1",
    port: 3306,
    db: "default_db",
    userName: "user",
    password: "password"
};

// Initialize connection with the configuration object
const connection = JdbcX.getConnection(config);
```

## Sample scripts

These samples can be found in the [how_to_use.gs](user/how_to_use.gs) file.

All examples assume operations on a MySQL table `example_table`.

Table structure:

```sql
CREATE TABLE `example_table` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `boolean_col` BOOLEAN,
  `integer_col` INT,
  `double_col` DOUBLE,
  `date_col` DATETIME,
  `array_col` JSON,
  `object_col` JSON,
  `null_col` VARCHAR(255),
  `blob_col` BLOB,
  `binary_col` VARBINARY(255)
);
# Added later (example 3):
ALTER TABLE example_table
    ADD COLUMN string_col VARCHAR(255) AFTER id;
```


### Sample 1: Creating a table
```javascript
function createTable() {

  // Initializes connection
  const connection = JdbcX.getConnection(config);

  const createTableQuery = `
    CREATE TABLE example_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      boolean_col BOOLEAN,
      integer_col INT,
      double_col DOUBLE,
      date_col DATETIME,
      array_col JSON,
      object_col JSON,
      null_col VARCHAR(255),
      blob_col BLOB,
      binary_col VARBINARY(255)
    );
  `;

  // Executes the SQL query to create the table
  const result = connection.execute(createTableQuery);
  Logger.log(result); // Outputs: true
}
```

### Sample 2: Running a query
```javascript
function selectFromTable() {
  // Initializes connection
  const connection = JdbcX.getConnection(config);

  // Executes the SQL query
  const result = connection.execute('SELECT * FROM example_table');
  Logger.log(result); // Outputs: true
}
```

### Sample 3: Adding new column & Inserting data into a table
```javascript
function insertDataIntoTable() {
  // Initializes connection
  const connection = JdbcX.getConnection(config);

  // Add new column to the table
  const addColumnQuery = `
    ALTER TABLE example_table
    ADD COLUMN string_col VARCHAR(255) AFTER id;
  `;
  const addColumnResult = connection.execute(addColumnQuery);
  Logger.log(addColumnResult); // Outputs: true if successful

  if (addColumnResult) {
    // Define table name, columns, and values to insert
    const table = 'example_table';
    const columns = ['boolean_col', 'integer_col', 'double_col', 'string_col'];
    const values = [true, 42, 3.14, 'Sample string'];

    // Executes the insert operation
    const result = connection.insertInto(table, columns, values);
    Logger.log(result); // Outputs: true if successful
  }
}
```

### Sample 4: Inserting an Array of Data into a Table
```javascript
function insertArrayDataIntoTable() {
  // Initializes connection
  const connection = JdbcX.getConnection(config);

  // Define table name and columns
  const table = 'example_table';
  const columns = ['boolean_col', 'string_col', 'integer_col', 'double_col', 'date_col',
                   'array_col', 'object_col', 'null_col', 'blob_col', 'binary_col'];

  // Define blob data
  const blobData = Utilities.newBlob('Example Blob Data');

  // Define array of data to insert [[row1_data], [row2_data], ..]
  const data = [
    [true,  'String 1', 123, 3.14, new Date(), ['array', 'data'],
      { key: 'value' }, null, blobData, Utilities.newBlob('Binary Data')],

    [false, 'String 2', 456, 6.28, new Date(), ['more',  'array', 'data'],
      { another: 'object' }, null, blobData, Utilities.newBlob('More Binary Data')],
      
    [true,  'String 3', 789, 9.42, new Date(), ['even',  'more',  'array', 'data'],
      { yet: 'another' }, null, blobData, Utilities.newBlob('Even More Binary Data')]
  ];

  // Define additional options
  const options = {
    autoCommit: false,
    updateDupls: true
  };

  // Executes the insert operation
  const result = connection.insertArrayToDBTable(table, columns, data, options);
  Logger.log(result); // Outputs: true if successful
}
```

### Sample 5: Async. Inserting an Array of Data into a Table
```javascript
function insertArrayDataIntoTableA() {
  // Initializes connection
  const connection = JdbcX.getConnection({...config, muteSQLExceptions: false});

  // Define table name and columns
  const table = 'example_table';
  const columns = ['boolean_col', 'string_col', 'integer_col', 'double_col', 'date_col',
                   'array_col', 'object_col', 'null_col', 'blob_col', 'binary_col'];

  // Define blob data
  const blobData = Utilities.newBlob('Example Blob Data');

  // Current date with time set to 00:00:00
  const today = JdbcX.dateTimeFormat(null, "yyyy-MM-dd HH:mm:ss", '', true);

  // Define array of data to insert
  const data = [
    [true,  'String 1', 123, 3.14, today, ['array', 'data'],
      { key: 'value' }, null, blobData, Utilities.newBlob('Binary Data A')],
    
    [false, 'String 2', 456, 6.28, today, ['more',  'array', 'data'],
      { another: 'object' }, null, blobData, Utilities.newBlob('Binary Data B')],
    
    [true,  'String 3', 789, 9.42, today, ['even',  'more',  'array', 'data'],
      { yet: 'another' }, null, blobData, Utilities.newBlob('Binary Data C')]
  ];

  // Executes the insert operation
  const result = connection.insertArrayToDBTableAsync(table, columns, data);
  Logger.log(result); // Outputs: true if successful
}
```

### Sample 6: Retrieving Data from the Table
```javascript
function retrieveDataFromTable() {
  // Initializes connection
  const connection = JdbcX.getConnection(config);

  // Define the query to retrieve data
  const query = 'SELECT * FROM example_table LIMIT 3';

  // Executes the query and retrieves the data
  const result = connection.queryDatabase(query);

  // Logs the result
  Logger.log(result);
}
```

### Sample 7: Retrieving Data with Filters and Return Type
```javascript
function retrieveFilteredData() {
  // Initializes connection
  const connection = JdbcX.getConnection(config);

  // Define table and columns to retrieve
  const table = "example_table";
  const columns = ["id", "boolean_col", "string_col", "integer_col", "date_col"];

  // Define return type (0 for nested objects, 1 for object with arrays)
  const returnType = 0;

  // Define filter criteria
  const filter = {
    column: "boolean_col",
    value: true,
    sort: "date_col",
    direction: "asc",
    limit: 3,
    offset: 1
  };

  // Specify database name (if different from the default one in config)
  const dbName = "myDatabase";

  // Retrieves data using the defined criteria
  const data = connection.retrieveDataFromDB(table, columns, returnType, filter /*, dbName*/);

  // Logs the retrieved data
  Logger.log(JSON.stringify(data));
}
```


### Sample 8: Running Multiple Tasks Concurrently

**Run Asynchronous Tasks:**
```javascript
  const conn = JdbcX.getConnection(config);
  const task = conn.AsyncDoMany([
    [conn.METHODS.queryDatabase, [stmt, second_db]],  // Querying with some arguments
    [conn.METHODS.queryDatabase, [stmt], "main_db"],  // Querying with a custom tag
    [conn.METHODS.retrieveDataFromDB, [table, columns]]
    // Additional method calls can be added here in the same format
  ]);
  var data = task.next();
```

**Example Usage:**
```javascript
function runMultipleTasks() {
  // Name of the secondary database
  const second_db = 'default_db';

  // Establishing connection using JdbcX with the given configuration
  const conn = JdbcX.getConnection(config);

  // SQL query to select columns from table
  const stmt = "SELECT `id`, `string_col`, `date_col` FROM `example_table` WHERE `boolean_col` = 1";


  // Retrieving data with filters and return type
  const table = 'example_table';
  const columns = ['id', 'string_col', 'date_col'];
  const filter = {column: "boolean_col", value: true};
  const returnType = 0;


  // Running multiple asynchronous database queries using AsyncDoMany
  const task = conn.AsyncDoMany([
    [conn.METHODS.queryDatabase, [stmt, second_db]],  // Querying with some arguments
    [conn.METHODS.queryDatabase, [stmt], "main_db"],  // Querying with a custom tag
    [conn.METHODS.retrieveDataFromDB, [table, columns, returnType, filter]],
    // Additional method calls can be added here in the same format
  ]);


  // The result of AsyncDoMany ('task') behaves like a generator function with 'next()'
  var results = [];

  // Getting the first result from the task
  var data = task.next();

  // Iterating through all results until done
  while (!data.done) {

    console.log("Task Result:", JSON.stringify(data));  // logging each result

    // Immediate processing if necessary
    if (data.run === 'queryDatabase'
        && data.tag === "main_db"
        && data.value) {
      anyProcessingWithData(data.value);
    }

    results.push(data.value);  // append to 'results' array
    data = task.next();        // getting next result from the task
  }

  // Logging the final result
  console.log(
    "Results of the executed tasks:",
    JSON.stringify(results)
  );
}
```

**Example Processing Function:**
```javascript
// Example function for processing data
function anyProcessingWithData(data) {
  // Custom processing logic for the retrieved data
  console.log("Processing data:", data);
}
```

**The output will log each task's result as it is retrieved:**
```
Task Result: {"run":"queryDatabase","value":[...]}
Task Result: {"run":"queryDatabase","tag":"main_db","value":[...]}
Task Result: {"run":"retrieveDataFromDB","value":[...]}
Processing data: [...]
Results of the executed tasks: [...]
```

<a name="async"></a>

# About Async

In Google Apps Script, user scripts run in a single thread, which affects the traditional understanding of asynchronicity. Methods suffixed with "Async" do not operate as typical asynchronous functions; they do not return promises, and therefore, should not be used with the async and await keywords. Instead, these methods trigger a POST request to a WebApp URL, which is handled by the library (application) in a separate thread. This allows for executing up to 20 parallel requests and processing their results simultaneously.

It's advisable to use regular library methods for a large number of small read requests, while asynchronous methods are more suitable for operations involving writing or reading large volumes of data.

<a name="quotas"></a>

# Limitations

The limitations of this library are primarily tied to the general quota on the number of API requests and JDBC connections for a Google account. For current limitations, please refer to the [Google Apps Script Quotas](https://developers.google.com/apps-script/guides/services/quotas) page.

<a name="issues"></a>

# Known Issues

1. **Data Type Detection in Async Functions:**
   - Automatic detection of data types in some functions using Async is not currently supported. Complex objects and functions need to be converted to string types. This includes date objects like `new Date()`, blobs, and other complex objects.

2. **Error Handling:**
   - In Async functions, it is recommended to set the **muteSQLException** parameter to `false` to catch errors on the user's script side.

3. **Request Retries:**
   - There is no built-in retry mechanism for failed data send/receive requests. Users need to manage this process manually.

These limitations and issues are important to consider when using the library to ensure smooth and efficient operation within the bounds of Google Apps Script quotas and capabilities.

# Important

- If you find this library useful, kindly consider starring it. Your support is greatly appreciated!

---

<a name="licence"></a>

# Licence

[MIT](LICENSE)

<a name="author"></a>

# Author

[Githnow](https://github.com/githnow/)

Should you have any inquiries or requests, please do not hesitate to contact me. I am always open to your feedback and suggestions!

<a name="updatehistory"></a>

# Update History

- v1.0.1 (June 1, 2024)

  1. Initial release.

[TOP](#top)
