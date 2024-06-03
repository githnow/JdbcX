/**
 * @fileoverview
 * JdbcX Library for Google App Scripts.
 * Author githnow.
 * GitHub https://github.com/githnow/JdbcX
 */



/** THE FIRST STEP */
function initialJDBCX() {
  // Example URL
  // https://script.google.com/macros/s/XYzacdwxpGdrnlLGVEhmGaolfv-Q4jSO-V9NyrRp22hCQK4sw7notQC2JZMojdXMXt0gt/dev

  const password = "new_password";  // Optional
  const jx_app_url = "webapp_url";
  JdbcX.setJXAppPassword(null, password);
  JdbcX.setJXAppURL(jx_app_url, password);
}



/** @type {JX_Config} */
// Your config here



/** Example: Creating a table */
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
  Logger.log(result); // Outputs: true if successful
}



/** Example: Running a query */
function selectFromTable() {
  // Initializes connection
  const connection = JdbcX.getConnection({...config, showTime: true});

  // Executes the SQL query
  const result = connection.execute('SELECT * FROM example_table');
  Logger.log(result); // Outputs: true if successful
}



/** Example: Inserting data into a table */
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



/** Example: Inserting an Array of Data into a Table */
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



/** Async Example: Inserting an Array of Data into a Table */
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

  // Define additional options
  const options = {
    autoCommit: false,
    updateDupls: true
  };

  // Executes the insert operation
  const result = connection.insertArrayToDBTableAsync(table, columns, data, options);
  Logger.log(result); // Outputs: true if successful
}


/** Example: Retrieving Data from the Table */
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



/** Example: Retrieving Data from the Table */
function retrieveDataFromTable() {
  // Initializes connection
  const connection = JdbcX.getConnection(config);

  // Define the query to retrieve data
  const query = 'SELECT * FROM example_table LIMIT 3';

  // Executes the query and retrieves the data
  const result = connection.retrieveDataFromDB().queryDatabase(query);

  // Logs the result
  Logger.log(result);
}


/** Example: Retrieving Data with Filters and Return Type */
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
  const data = connection.retrieveDataFromDBAsync(table, columns, returnType, filter /*, dbName*/);

  // Logs the retrieved data
  Logger.log(JSON.stringify(data));
}



/** Example: Running Multiple Tasks Concurrently */
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
  var task = conn.AsyncDoMany([
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

// Example function for processing data
function anyProcessingWithData(data) {
  // Custom processing logic for the retrieved data
  console.log("Processing data:", data);
}


