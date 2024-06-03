/**
 * Generates a SQL query based on the specified database prefix, table name,
 * columns, and filter criteria.
 *
 * The function generates a SQL query tailored for different database types
 * (MySQL, PostgreSQL, SQL Server) by utilizing nested functions specific to each
 * database type.
 *
 * @todo `offset` param.
 * @param {string} prefix The database prefix indicating the database type
 *     (e.g., 'jdbc:mysql://').
 * @param {string} table The name of the table from which to select data.
 * @param {Array<string>} columns An optional array of column names to select.
 *     If not specified, all columns are selected.
 * @param {queryFilter=} filter An optional object containing filter criteria
 *     for the query:
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
 *
 * @returns {string} The generated SQL query.
 * @throws {Error} Throws an error if the database type specified by the prefix
 *     is unsupported.
 */
function generateQuery(prefix, table, columns, filter) {

    // MySQL query generator
    function generateQueryMySQL() {
      var queryColumns = columns && Array.isArray(columns) && columns.length > 0
          ? columns.map(function(col) { return "`" + col + "`" }).join(", ")
          : '*';

      var query = 'SELECT ' + queryColumns + ' FROM `' + table + '`';

      if ((filter.column)
          && (
            filter.value_from !== undefined
            || filter.value_to !== undefined
            || filter.value !== undefined
          ))
      {
        query += " WHERE `" + filter.column + "`";
        if (filter.toUnixTime === true) {
          if (filter.value_from !== undefined)
              filter.value_from = dateTimeFormat(filter.value_from, 'unix');
          if (filter.value_to !== undefined)
              filter.value_to = dateTimeFormat(filter.value_to, 'unix');
          if (filter.value !== undefined)
              filter.value = dateTimeFormat(filter.value, 'unix');
        }

        if (filter.value !== undefined) {
            query += " = '" + filter.value + "'";
        } else {
          if (filter.value_from !== undefined && filter.value_to !== undefined) {
            query += " BETWEEN '" + filter.value_from +
                     "' AND '" + filter.value_to + "'";
          } else if (filter.value_from !== undefined) {
            query += " > '" + filter.value_from + "'";
          } else if (filter.value_to !== undefined) {
            query += " < '" + filter.value_to + "'";
          }
        }
      }

      if (filter.sort) {
        query += " ORDER BY `" + filter.sort + "`";
        if (filter.direction
            && (filter.direction.toLowerCase() === "asc"
            || filter.direction.toLowerCase() === "desc")) {
          query += " " + filter.direction.toUpperCase();
        }
      }

      if (filter.limit) {
          if (!filter.offset) {
            filter.offset = "0";
          }
        query += " LIMIT " + filter.limit + " OFFSET " + filter.offset;
      }

      return query;
    }

    // PostgreSQL query generator
    function generateQueryPostgreSQL() {
      var queryColumns = columns && Array.isArray(columns) && columns.length > 0
          ? columns.map(function(col) { return '"' + col + '"' }).join(", ")
          : '*';

      var query = 'SELECT ' + queryColumns + ' FROM "' + table + '"';

      if ((filter.column)
          && (
            filter.value_from !== undefined
            || filter.value_to !== undefined
            || filter.value !== undefined
          ))
      {
        query += ' WHERE "' + filter.column + '"';
        if (filter.toUnixTime === true) {
          if (filter.value_from !== undefined)
              filter.value_from = dateTimeFormat(filter.value_from, 'unix');
          if (filter.value_to !== undefined)
              filter.value_to = dateTimeFormat(filter.value_to, 'unix');
          if (filter.value !== undefined)
              filter.value = dateTimeFormat(filter.value, 'unix');
        }

        if (filter.value !== undefined) {
            query += " = '" + filter.value + "'";
        } else {
          if (filter.value_from !== undefined && filter.value_to !== undefined) {
            query += " BETWEEN '" + filter.value_from +
                     "' AND '" + filter.value_to + "'";
          } else if (filter.value_from !== undefined) {
            query += " > '" + filter.value_from + "'";
          } else if (filter.value_to !== undefined) {
            query += " < '" + filter.value_to + "'";
          }
        }
      }

      if (filter.sort) {
          query += ' ORDER BY "' + filter.sort + '"';
          if (filter.direction
              && (filter.direction.toLowerCase() === "asc"
              || filter.direction.toLowerCase() === "desc")) {
            query += ' ' + filter.direction.toUpperCase();
          }
      }

      if (filter.limit) {
          if (!filter.offset) {
            filter.offset = "0";
          }
        query += ' LIMIT ' + filter.limit + ' OFFSET ' + filter.offset;
      }

      return query;
    }

    // SQL Server query generator
    function generateQuerySQLServer() {
      var queryColumns = columns && Array.isArray(columns) && columns.length > 0
          ? columns.map(function(col) { return "[" + col + "]" }).join(", ")
          : '*';

      var query = 'SELECT ' + queryColumns + ' FROM [' + table + ']';

      if ((filter.column)
          && (
            filter.value_from !== undefined
            || filter.value_to !== undefined
            || filter.value !== undefined
          ))
      {
          query += " WHERE [" + filter.column + "]";
          if (filter.toUnixTime === true) {
              if (filter.value_from !== undefined)
                  filter.value_from = dateTimeFormat(filter.value_from, 'unix');
              if (filter.value_to !== undefined)
                  filter.value_to = dateTimeFormat(filter.value_to, 'unix');
              if (filter.value !== undefined)
                  filter.value = dateTimeFormat(filter.value, 'unix');
          }

          if (filter.value !== undefined) {
              query += " = '" + filter.value + "'";
          } else {
            if (filter.value_from !== undefined && filter.value_to !== undefined) {
                query += " BETWEEN '" + filter.value_from +
                         "' AND '" + filter.value_to + "'";
            } else if (filter.value_from !== undefined) {
                query += " > '" + filter.value_from + "'";
            } else if (filter.value_to !== undefined) {
                query += " < '" + filter.value_to + "'";
            }            
          }
      }

      if (filter.sort) {
          query += " ORDER BY [" + filter.sort + "]";
          if (filter.direction
              && (filter.direction.toLowerCase() === "asc"
              || filter.direction.toLowerCase() === "desc")) {
              query += " " + filter.direction.toUpperCase();
          }
      }

      if (filter.limit) {
          if (!filter.offset) {
            filter.offset = "0";
          }
        query += " OFFSET " + filter.offset +
                  " ROWS FETCH NEXT " + filter.limit + " ROWS ONLY";
      }

      return query;
    }

    var sql_query = '';

    switch (prefix) {
      case 'jdbc:mysql://':
      case 'jdbc:google:mysql://':
        sql_query = generateQueryMySQL();
        break;
      case 'jdbc:postgresql://':
        sql_query = generateQueryPostgreSQL();
        break;
      case 'jdbc:sqlserver://':
        sql_query = generateQuerySQLServer();
        break;
      default:
        L(prefix); // 'jdbc:mysql://'
        throw new Error("Unsupported database type");
    }

  return sql_query;
}

/**
 * ### Description
 * Trims a SQL query by removing a specified column from the SELECT clause.
 * If the removed column was the only one selected, it replaces the SELECT clause
 * with 'SELECT *'.
 *
 * ### Example
 * ```js
 * const query = "SELECT id, name, age FROM users";
 * const trimmedQuery = trimQuery(query, 'name');
 * console.log(trimmedQuery); // Outputs: "SELECT id, age FROM users"
 * ```
 *
 * @param {string} query The SQL query to be trimmed.
 * @param {string} elem The name of the column to be removed from the SELECT clause.
 * @return {string} The trimmed SQL query.
 */
function trimQuery(query, elem) {
  try {
    var nq = query.match(/SELECT(.*)FROM/)[1].trim();
    nq = nq.split(/`, `/);
    nq = nq.map(function(item) {
      return item.replace(/`/g, '');
    });
    nq = nq.filter(function(ne) {
      return ne !== elem;
    });
    if (nq.length === 0) {
      nq = query.replace(/SELECT.*FROM/, 'SELECT * FROM');
    } else {
      var cols = nq.map(function(col) {
        return "`" + col + "`";
      }).join(", ");
      nq = query.replace(/SELECT.*FROM/, "SELECT " + cols + " FROM");
    }
  } catch (e) {
    console.warn(e);
    return query;
  }
  return nq;
}

