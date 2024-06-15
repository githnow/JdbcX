/**
 * Generates a SQL query based on the specified database prefix, table name,
 * columns, and filter criteria.
 *
 * The function generates a SQL query tailored for different database types
 * (MySQL, PostgreSQL, SQL Server) by utilizing nested functions specific
 * to each database type.
 *
 * @param {string} prefix The database prefix indicating the database type
 *     (e.g., 'jdbc:mysql://').
 * @param {string} table The name of the table from which to select data.
 * @param {Array<string>} columns An optional array of column names to select.
 *     If not specified, all columns are selected.
 * @param {queryFilter|queryFilter[]=} filter An optional object or array of
 *     objects containing filter criteria for the query. If the `filter`
 *     parameter is an array of objects, the conditions will be combined
 *     using the AND operator. The filter contains the following options:
 *
 * | Parameter   | Description                                                      |
 * |:------------|:-----------------------------------------------------------------|
 * | `column`    | The name of the column to filter on.
 * | `value`     | The value to match in the specified column (WHERE '=').
 * | `value_from`| The starting value for range-based filtering (WHERE '>').
 * | `value_to`  | The ending value for range-based filtering (WHERE '<').
 * | `toUnixTime`| Indicates whether to convert the dates of the filter values
 * |             | to a timestamp (UNIX format).
 * | `sort`      | The column name to use for sorting (ORDER BY).
 * | `direction` | The sorting direction (ASC \| DESC):
 * |             | __'`asc`'__ for ascending, __'`desc`'__ for descending.
 * | `limit`     | The maximum number of records to return (LIMIT).
 * | `offset`    | The number of records to skip before returning results.
 * | `like`      | Matching. The value to match using LIKE %...%.
 * | `notlike`   | Matching. The value to exclude using NOT LIKE.
 * | `regex`     | Matching. The regular expression to match REGEXP.
 * | ----------- | ---------------------------------------------------------------- |
 *
 * __Note__: _The arguments are mutually exclusive_:
 *     - `value`,
 *     - `value_from, value_to`
 *     - `like`,
 *     - `notlike`,
 *     - `regex`
 *
 * @param {boolean=} countOnly An optional flag indicating
 *     if the query should only count records.
 *
 * @returns {string} The generated SQL query.
 * @throws {Error} Throws an error if the database type specified by the prefix
 *     is unsupported.
 */
function generateQuery(prefix, table, columns, filter, countOnly) {

    // MySQL query generator
    function generateQueryMySQL() {

      function criteriaProcessing(filter) {
        var query = "";

        if (filter.column) {
          if (filter.toUnixTime === true) {
            if (filter.value_from !== undefined)
                filter.value_from = dateTimeFormat(filter.value_from, 'unix');
            if (filter.value_to !== undefined)
                filter.value_to = dateTimeFormat(filter.value_to, 'unix');
            if (filter.value !== undefined)
                filter.value = dateTimeFormat(filter.value, 'unix');
          }

          query += "`" + filter.column + "`";

          if (filter.value !== undefined) {
            query += " = '" + filter.value + "'";
          }
          else if (filter.like !== undefined) {
            query += " LIKE '%" + filter.like + "%'";
          }
          else if (filter.notlike !== undefined) {
            query += " NOT LIKE '%" + filter.notlike + "%'";
          }
          else if (filter.regex !== undefined) {
            query += " REGEXP '" + filter.regex + "'";
          }
          else {
            if (filter.value_from !== undefined
                && filter.value_to !== undefined) {
              query += " BETWEEN '" + filter.value_from +
                       "' AND '" + filter.value_to + "'";
            }
            else if (filter.value_from !== undefined) {
              query += " > '" + filter.value_from + "'";
            }
            else if (filter.value_to !== undefined) {
              query += " < '" + filter.value_to + "'";
            }
          }
        }

        return query;
      }

      var queryColumns = countOnly
        ? 'COUNT(*) AS count'
        : (columns && Array.isArray(columns) && columns.length > 0
            ? columns.map(function(col) { return "`" + col + "`" }).join(", ")
            : '*');

      var query = 'SELECT ' + queryColumns + ' FROM `' + table + '`';

      if (filter) {
        var filter_ = [];

        if (getTypeOf_(filter) === 'object') {
          filter_.push(filter);
        } else {
          filter_ = filter;
        }

        var cond = filter_.map(criteriaProcessing).filter(Boolean);
        if (cond.length > 0) {
          query += " WHERE " + cond.join(" AND ");
        }

        filter = filter_.reduce(function(acc, obj) {
          for (var key in obj) {
            if (!acc[key]) {
              acc[key] = obj[key];
            }
          }
          return acc;
        }, {});

        if (!countOnly) {
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
        }
      }

      return query;
    }

    // PostgreSQL query generator
    function generateQueryPostgreSQL() {

      function criteriaProcessing(filter) {
        var query = "";

        if (filter.column) {
          if (filter.toUnixTime === true) {
            if (filter.value_from !== undefined)
                filter.value_from = dateTimeFormat(filter.value_from, 'unix');
            if (filter.value_to !== undefined)
                filter.value_to = dateTimeFormat(filter.value_to, 'unix');
            if (filter.value !== undefined)
                filter.value = dateTimeFormat(filter.value, 'unix');
          }

          query += '"' + filter.column + '"';

          if (filter.value !== undefined) {
            query += " = '" + filter.value + "'";
          }
          else if (filter.like !== undefined) {
            // this line was generated in ChatGPT:
            query += " LIKE '%" + filter.like + "%'";
          }
          else if (filter.notlike !== undefined) {
            // also ChatGPT:
            query += " NOT LIKE '%" + filter.notlike + "%'";
          }
          else if (filter.regex !== undefined) {
            // also ChatGPT:
            query += " ~ '" + filter.regex + "'";
          }
          else {
            if (filter.value_from !== undefined
                && filter.value_to !== undefined) {
              query += " BETWEEN '" + filter.value_from +
                        "' AND '" + filter.value_to + "'";
            }
            else if (filter.value_from !== undefined) {
              query += " > '" + filter.value_from + "'";
            }
            else if (filter.value_to !== undefined) {
              query += " < '" + filter.value_to + "'";
            }
          }
        }

        return query;
      }

      var queryColumns = countOnly
          ? 'COUNT(*) AS count'
          : (columns && Array.isArray(columns) && columns.length > 0
              ? columns.map(function(col) { return '"' + col + '"' }).join(", ")
              : '*');

      var query = 'SELECT ' + queryColumns + ' FROM "' + table + '"';

      if (filter) {
        var filter_ = [];

        if (getTypeOf_(filter) === 'object') {
          filter_.push(filter);
        } else {
          filter_ = filter;
        }

        var cond = filter_.map(criteriaProcessing).filter(Boolean);
        if (cond.length > 0) {
          query += " WHERE " + cond.join(" AND ");
        }

        filter = filter_.reduce(function(acc, obj) {
          for (var key in obj) {
            if (!acc[key]) {
              acc[key] = obj[key];
            }
          }
          return acc;
        }, {});

        if (!countOnly) {
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
        }
      }

      return query;
    }

    // SQL Server query generator
    function generateQuerySQLServer() {

      function criteriaProcessing(filter) {
        var query = "";

        if (filter.column) {
          if (filter.toUnixTime === true) {
            if (filter.value_from !== undefined)
                filter.value_from = dateTimeFormat(filter.value_from, 'unix');
            if (filter.value_to !== undefined)
                filter.value_to = dateTimeFormat(filter.value_to, 'unix');
            if (filter.value !== undefined)
                filter.value = dateTimeFormat(filter.value, 'unix');
          }

          query += "[" + filter.column + "]";

          if (filter.value !== undefined) {
              query += " = '" + filter.value + "'";
          }
          else if (filter.like !== undefined) {
            // this line was generated in ChatGPT:
            query += " LIKE '%" + filter.like + "%'";
          }
          else if (filter.notlike !== undefined) {
            // also ChatGPT:
            query += " NOT LIKE '%" + filter.notlike + "%'";
          }
          else if (filter.regex !== undefined) {
            // also ChatGPT:
            query += " LIKE '%" + filter.regex + "%'";
          }
          else {
            if (filter.value_from !== undefined
                && filter.value_to !== undefined) {
              query += " BETWEEN '" + filter.value_from +
                        "' AND '" + filter.value_to + "'";
            }
            else if (filter.value_from !== undefined) {
              query += " > '" + filter.value_from + "'";
            }
            else if (filter.value_to !== undefined) {
              query += " < '" + filter.value_to + "'";
            }
          }
        }

        return query;
      }

      var queryColumns = countOnly
          ? 'COUNT(*) AS count'
          : (columns && Array.isArray(columns) && columns.length > 0
              ? columns.map(function(col) { return "[" + col + "]" }).join(", ")
              : '*');
      
      var query = 'SELECT ' + queryColumns + ' FROM [' + table + ']';

      if (filter) {
        var filter_ = [];

        if (getTypeOf_(filter) === 'object') {
          filter_.push(filter);
        } else {
          filter_ = filter;
        }

        var cond = filter_.map(criteriaProcessing).filter(Boolean);
        if (cond.length > 0) {
          query += " WHERE " + cond.join(" AND ");
        }

        filter = filter_.reduce(function(acc, obj) {
          for (var key in obj) {
            if (!acc[key]) {
              acc[key] = obj[key];
            }
          }
          return acc;
        }, {});

        if (!countOnly) {
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
        }
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
 * If the removed column was the only one selected, it replaces the SELECT
 * clause with 'SELECT *'.
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

