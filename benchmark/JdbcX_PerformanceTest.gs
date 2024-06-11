function runBenchmark() {
  const rowCounts = [1, 5, 10, 25, 50, 100, 200, 300, 400, 500, 1000, 2500, 3000, 5000, 10000, 15000, 30000, 50000, 100000];
  const writeMethods = [
    { name: 'JDBC', func: writeRandomData_JDBC },
    { name: 'JDBCX', func: writeRandomData_JDBCX },
    { name: 'JDBCX_A', func: writeRandomData_JDBCX_A },
    { name: 'JDBCX_AMany', func: writeRandomData_JDBCX_AMany }
  ];
  const readMethods = [
    { name: 'JDBC', func: retrieveDataFromTable_JDBC },
    { name: 'JDBCX', func: retrieveDataFromTable_JDBCX },
    { name: 'JDBCX_A', func: retrieveDataFromTable_JDBCX_A },
    { name: 'JDBCX_AMany', func: retrieveDataFromTable_JDBCX_AMany }
  ];

  const writeResults = [];
  const readResults = [];
  var last_rowCount;
  var last_method = '';

  var startTime = new Date().getTime();
  var elapsedTime = new Date().getTime() - startTime;
  var maxTime = 280000;
  console.log("Benchmark started.");

  try {
    for (const rowCount of rowCounts) {
      console.log("Number of rows:", rowCount);
      last_rowCount = rowCount;
      for (const method of writeMethods) {
        elapsedTime = new Date().getTime() - startTime;
        if (elapsedTime > maxTime) throw new Error("Exceeded maximum execution time");
        console.log("Current method:", method.func.name);
        last_method = method.func.name;
        const benchmarkStartTime = new Date().getTime();
        try {
          const benchmarkRows = method.func(rowCount);
          const benchmarkEndTime = new Date().getTime();
          const benchmarkDuration = benchmarkEndTime - benchmarkStartTime;

          writeResults.push({
            rowCount: rowCount,
            method: method.name,
            singleThreadedDuration: benchmarkDuration,
            multiThreadedDuration: method.name === 'JDBCX_AMany' ? benchmarkDuration : '',
            rows: benchmarkRows
          });
        }
        catch (e) {
          writeResults.push({
            rowCount: rowCount,
            method: method.name,
            singleThreadedDuration: -1,
            multiThreadedDuration: `ERROR: ${e.message}`,
            rows: rowCount
          });
        }
      }

      for (const method of readMethods) {
        elapsedTime = new Date().getTime() - startTime;
        if (elapsedTime > maxTime) throw new Error("Exceeded maximum execution time");
        console.log("Current method:", method.func.name);
        last_method = method.func.name;
        const benchmarkStartTime = new Date().getTime();
        try {
          const benchmarkRows = method.func(rowCount);
          const benchmarkEndTime = new Date().getTime();
          const benchmarkDuration = benchmarkEndTime - benchmarkStartTime;

          readResults.push({
            rowCount: rowCount,
            method: method.name,
            singleThreadedDuration: benchmarkDuration,
            multiThreadedDuration: method.name === 'JDBCX_AMany' ? benchmarkDuration : '',
            rows: benchmarkRows.length
          });
        }
        catch (e) {
          readResults.push({
            rowCount: rowCount,
            method: method.name,
            singleThreadedDuration: -1,
            multiThreadedDuration: `ERROR: ${e.message}`,
            rows: rowCount
          });
        }
      }
    }
  }
  catch (e) {
    console.error(e.message);
    console.log("Last 'rowCount' value: %s. Last function: '%s'.", last_rowCount, last_method);
  }
  finally {
    const ss = SpreadsheetApp.openById("14Xdr0LeoyL-IPK9fMb0B2eckIk2UPhHPmdi23_jp4w4");
    if (writeResults && writeResults.length > 0) {
      writeBenchmarkResults(ss, 'Write Benchmark Results', writeResults);
    }

    if (readResults && readResults.length > 0) {
      writeBenchmarkResults(ss, 'Read Benchmark Results', readResults);
    }
    
  }
}


function writeBenchmarkResults(ss, sheetName, results) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() < 1) {
    sheet.appendRow(['Row Count', 'Method', 'Single-Threaded Duration (ms)', 'Multi-Threaded Duration (ms)', 'Check']);     
  }

  // Write the results to sheet
  for (const result of results) {
    sheet.appendRow([result.rowCount, result.method, result.singleThreadedDuration, result.multiThreadedDuration, result.rows]);
  }
}


function retrieveDataFromTable_JDBC(rowCount=2) {
  const connection = Jdbc.getConnection(config.databaseUrl, config.userName, config.password);
  const query = `SELECT * FROM example_table LIMIT ${rowCount}`;
  var columnsArray = [];
  var resultsArray = [];

  const stmt = connection.createStatement();
  const results = stmt.executeQuery(query);
  const numCols = results.getMetaData().getColumnCount();
  
  for (var col = 0; col < numCols; col++) {
    columnsArray.push(results.getMetaData().getColumnName(col + 1));
  }

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

  results.close();
  stmt.close();
  connection.close();
  // [ [ '1', 'Sample string', '1', '42', '3.14', null, null, null, null, null, null ], [ '2', 'String 1', '1', '123', '3.14', '2024-06-02 08:31:05.0', '["array", "data"]', '{"key": "value"}', null, 'Example Blob Data', 'Binary Data' ] ]
  return result.data;
}

function retrieveDataFromTable_JDBCX(rowCount=2) {
  const connection = JdbcX.getConnection(config);
  const query = `SELECT * FROM example_table LIMIT ${rowCount}`;
  const result = connection.queryDatabase(query);
  // [ [ '1', 'Sample string', '1', '42', '3.14', null, null, null, null, null, null ], [ '2', 'String 1', '1', '123', '3.14', '2024-06-02 08:31:05.0', '["array", "data"]', '{"key": "value"}', null, 'Example Blob Data', 'Binary Data' ] ]
  return result;
}

function retrieveDataFromTable_JDBCX_A(rowCount=2) {
  const connection = JdbcX.getConnection(config);
  const query = `SELECT * FROM example_table LIMIT ${rowCount}`;
  const result = connection.queryDatabaseAsync(query);
  // [ [ '1', 'Sample string', '1', '42', '3.14', null, null, null, null, null, null ], [ '2', 'String 1', '1', '123', '3.14', '2024-06-02 08:31:05.0', '["array", "data"]', '{"key": "value"}', null, 'Example Blob Data', 'Binary Data' ] ]
  return result;
}

function retrieveDataFromTable_JDBCX_AMany(rowCount=2) {
  const conn = JdbcX.getConnection(config);
  const maxTasks = rowCount < 5000 ? 10 : 15;
  const numTasks = rowCount > 100 ? Math.min(maxTasks, Math.ceil(rowCount / 100)) : 1;
  const rowsPerTask = Math.ceil(rowCount / numTasks);

  // Creating an array of tasks
  const tasksArray = [];
  for (let i = 0; i < numTasks; i++) {
    const offset = i * rowsPerTask;
    const query = `SELECT * FROM example_table LIMIT ${rowsPerTask} OFFSET ${offset}`;
    tasksArray.push([conn.METHODS.queryDatabase, [query], `t_${i + 1}`]);
  }

  // Run tasks
  const tasks = conn.AsyncDoMany(tasksArray);

  // Getting results
  const results = [];
  let result = tasks.next();

  while (!result.done) {
    if (!result.error) results.push(...result.value);
    result = tasks.next();
  }

  // Returning a combined array of results
  // [ [ '1', 'Sample string', '1', '42', '3.14', null, null, null, null, null, null ], [ '2', 'String 1', '1', '123', '3.14', '2024-06-02 08:31:05.0', '["array", "data"]', '{"key": "value"}', null, 'Example Blob Data', 'Binary Data' ] ]
  return results;
}



function generateRandomData(funcName) {
  const booleanCol = Math.random() < 0.5;
  const integerCol = Math.floor(Math.random() * 1000) + 1;
  const doubleCol = Math.random() * 1000;
  const dateCol   = JdbcX.dateTimeFormat(new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)), "yyyy-MM-dd HH:mm:ss");
  const arrayCol  = JSON.stringify([...Array(Math.floor(Math.random() * 10) + 1)].map(() => Math.floor(Math.random() * 100) + 1));
  const objectCol = JSON.stringify({ key1: Math.floor(Math.random() * 100) + 1, key2: Math.random() * 100 });
  const nullCol = Math.random() < 0.5 ? null : 'some_string';
  const blobCol = Utilities.newBlob(new Uint8Array(Math.floor(Math.random() * 1024) + 1));
  const binaryCol = Utilities.newBlob("BINARY_DATA");
  // const stringCol = [...Array(Math.floor(Math.random() * 255) + 1)].map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
  const stringCol = funcName || '';
  return [booleanCol, integerCol, doubleCol, dateCol, arrayCol, objectCol, nullCol, blobCol, binaryCol, stringCol];
}

function writeRandomData_JDBC(rowCount=1) {

  function insertArrayToDB_JDBC(table, header, data, autoCommit=false) {
    var result = false;
    var stringTypes = [];
    var typeAsString = function(type) {
      return stringTypes.indexOf(type) !== -1;
    };

    try {
      conn = Jdbc.getConnection(config.databaseUrl, config.userName, config.password);
      conn.setAutoCommit(autoCommit);
      const headerString = header.map(col => '`' + col + '`').join(', ');
      const placeholders = header.map(() => '?').join(', ');

      const insertQuery = `INSERT INTO \`${table}\` (${headerString}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE`;
      const updateFields = header.map(field => '`' + field + '` = VALUES(`' + field + '`)').join(', ');
      const fullInsertQuery = insertQuery + ' ' + updateFields;

      var stmt = conn.prepareStatement(fullInsertQuery);

      for (let i = 0; i < data.length; i++) {
        let rowData = data[i];
        
        for (let j = 0; j < header.length; j++) {
          var value = (rowData[j] !== undefined && rowData[j] !== "") ? rowData[j] : null;

          if (value === null) {
            stmt.setNull(j + 1, 0);
          } else {
            switch (typeof value) {
                case 'boolean':
                  if (typeAsString('boolean')) {
                    stmt.setString(j + 1, String(value));
                  } else {
                    stmt.setBoolean(j + 1, value);
                  }
                  break;

                case 'number':
                  if (Math.floor(value) === value) {
                    if (typeAsString('integer')) {
                      stmt.setString(j + 1, String(value));
                    } else {
                      stmt.setInt(j + 1, value);
                    }
                  } else {
                    if (typeAsString('double')) {
                      stmt.setString(j + 1, String(value));
                    } else {
                      stmt.setDouble(j + 1, value);
                    }
                  }
                  break;

                case 'string':
                  stmt.setString(j + 1, value);
                  break;

                case 'object':
                  if (value instanceof Date || typeof value.setHours === 'function') {
                    try {
                      value = new Date(value);
                      stmt.setString(j + 1, dateTimeFormat(value, 'yyyy-MM-dd HH:mm:ss'));
                    } catch (e) {
                      stmt.setString(j + 1, value);
                    }
                  } else {
                    if (typeof value.getBytes === 'function') {
                      stmt.setBytes(j + 1, value.getBytes());
                    } else {
                      if (typeAsString('array') || typeAsString('object')) {
                        stmt.setString(j + 1, JSON.stringify(value));
                      } else {
                        try {
                          stmt.setObject(j + 1, JSON.stringify(value));
                        } catch (e) {
                          stmt.setString(j + 1, JSON.stringify(value));
                        }
                      }
                    }
                  }
                  break;

                default:
                stmt.setString(j + 1, String(value));
                break;
            }
          }
        }
        stmt.addBatch();
      }

      const batch = stmt.executeBatch();
      if (!autoCommit) conn.commit();

      const warnings = conn.getWarnings();
      if (warnings && warnings.length > 0) console.log("Warnings:", warnings);

      result = true;

    }
    catch (err) {
      console.log('Failed with an error %s', err.message);
      console.log('Last value:', value);
      if (err.stack) console.log('Stack trace: %s', err.stack);
    }
    finally {
      if (stmt) stmt.close();
      if (conn) conn.close();
    }

    return result;
  }

  const table = 'example_table';
  const columns = ['boolean_col', 'integer_col', 'double_col', 'date_col', 'array_col', 'object_col', 'null_col', 'blob_col', 'binary_col', 'string_col'];
  const dataRows = Array.from({ length: rowCount }, () => generateRandomData(this.func.name));

  // true if the data was successfully inserted
  const success = insertArrayToDB_JDBC(table, columns, dataRows, true);
  return success ? rowCount : 0;
}

function writeRandomData_JDBCX(rowCount=1) {
  const conn = JdbcX.getConnection(config);
  const table = 'example_table';
  const columns = ['boolean_col', 'integer_col', 'double_col', 'date_col', 'array_col', 'object_col', 'null_col', 'blob_col', 'binary_col', 'string_col'];
  const dataRows = Array.from({ length: rowCount }, () => generateRandomData(this.func.name));
  const options = {
    autoCommit: true,
    updateDuplicates: true
  };

  // true if the data was successfully inserted
  const success = conn.insertArrayToDBTable(table, columns, dataRows, options);
  return success ? rowCount : 0;
}

function writeRandomData_JDBCX_A(rowCount=1) {
  const conn = JdbcX.getConnection(config);
  const table = 'example_table';
  const columns = ['boolean_col', 'integer_col', 'double_col', 'date_col', 'array_col', 'object_col', 'null_col', 'blob_col', 'binary_col', 'string_col'];
  const dataRows = Array.from({ length: rowCount }, () => generateRandomData(this.func.name));
  const options = {
    autoCommit: true,
    updateDuplicates: true
  };

  // true if the data was successfully inserted
  const success = conn.insertArrayToDBTableAsync(table, columns, dataRows, options);
  return success ? rowCount : 0;
}

function writeRandomData_JDBCX_AMany(rowCount=1) {
  const conn = JdbcX.getConnection(config);
  const table = 'example_table';
  const columns = ['boolean_col', 'integer_col', 'double_col', 'date_col', 'array_col', 'object_col', 'null_col', 'blob_col', 'binary_col', 'string_col'];
  const dataRows = Array.from({ length: rowCount }, () => generateRandomData(this.func.name));
  const options = {
    autoCommit: true,
    updateDuplicates: true
  };

  // Determining the number of tasks
  const maxTasks = rowCount < 5000 ? 10 : 15;
  const numTasks = rowCount > 100 ? Math.min(maxTasks, Math.ceil(rowCount / 100)) : 1;
  const rowsPerTask = Math.ceil(rowCount / numTasks);

  // Creating an array of tasks
  const tasksArray = [];
  for (let i = 0; i < numTasks; i++) {
    const start = i * rowsPerTask;
    const end = start + rowsPerTask;
    const taskDataRows = dataRows.slice(start, end);
    tasksArray.push([conn.METHODS.insertArrayToDBTable, [table, columns, taskDataRows, options], taskDataRows.length]);
  }

  // Run tasks
  const task = conn.AsyncDoMany(tasksArray);

  // success tasks counter
  var success = 0;
  // recorded data rows count
  var results = 0;

  var data = task.next();

  while (!data.done) {
    if (!data.error) {
      if (data.value & data.value === true) {
        if (data.tag) results += data.tag;
        success++;
      }
    }
    data = task.next();
  }
  // console.log('Success tasks', success);

  // Returning number of recorded rows
  return results;
}

