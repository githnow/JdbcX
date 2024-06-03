/**
 * Defines whether to save the last post request in the script properties.
 * If `true` post request will be saved to `LAST_RUN` property. 
 * @define {boolean}
 */
var saveLastPost = false;


/**
 * Handles HTTP POST requests, initializing a JdbcX instance with the provided
 * configuration, and executing tasks using the JdbcX instance.
 *
 * If an error occurs, returns a JSON response with the error details.
 * @name _
 * @param {Object} e The event parameter containing POST data.
 * @param {Object} e.postData The POST data object.
 * @param {string} e.postData.contents The JSON string containing
 *     the request payload.
 *
 * @return {ContentService.TextOutput} The result of executing the tasks or response
 *     containing the error details formatted as JSON.
 */
function doPost(e) {
  var obj, param;
  var this_, jdbcx_;
  var result;
  try {
    obj = JSON.parse(e.postData.contents);
    param = ( obj && obj.context && obj.context.config )
        ? obj.context.config
        : null;
    // Block request.
    if (getSetting_("LOCK")) {
      throw new Error(
          'Async methods are disabled in the public version. ' +
          'Please create a copy and use it in your own version. ' +
          'For more info see: ' +
          'https://github.com/githnow/JdbcX#deploy.');
    }
    jdbcx_ = new JdbcX(param || null);
    this_ = param ? jdbcx_ : this;
    result = jdbcx_.RunTasks(this_, e);
    if (saveLastPost) setProp_("LAST_RUN", obj);
  } catch(e) {
    setProp_("LAST_ERROR", e);
    result = ContentService.createTextOutput(
      JSON.stringify({Error: e.message})
    ).setMimeType(ContentService.MimeType.JSON);
  }

  return result;
}

