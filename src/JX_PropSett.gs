/**
 * @fileoverview Utility functions for managing script properties.
 * Sets and retrieves settings and properties.
 */

/**
 * Retrieves the current WebApp URL set for this JdbcX instance.
 * @private
 * @returns {string} The currently set WebApp URL.
 */
function getJXAppURL() {
  return getSetting_("jdbcx_url");
}


/**
 * Sets the WebApp URL for access to this instance.
 *
 * This feature enables asynchronous queries for async functions of JdbcX. The URL
 * is stored in the script settings and is not accessible to external observers.
 *
 * Example URL
 * ```
 * https://script.google.com/macros/s/XYzacdwxpGdrnlLGVEhmGaolfv-Q4jSO-V9NyrRp22hCQK4sw7notQC2JZMojdXMXt0gt/dev
 * ```
 *
 * If the source code changes, you need to update this URL from a user script
 * externally.
 *
 * @param {string} url The URL to be set for WebApps access.
 * @param {string=} password The password to authorize the URL change.
 *
 * @throws {Error} If the URL is not valid.
 *
 * @returns {boolean} `true` if the URL was successfully set, `false` otherwise.
 */
function setJXAppURL(url, password) {
  if (!url) throw new Error("URL is not valid.");
  password = password === undefined ? null: password;
  return getSetting_("password") === password ? setSetting_("jdbcx_url", url) : false;
}


/**
 * Sets the password for the JdbcX application.
 *
 * The password is needed to ensure that only authorized users can change
 * the WebApp URL. The password is stored in the script settings and is not
 * accessible to external observers.
 *
 * @param {string} password1 The current password.
 * @param {string} password2 The new password to set.
 *
 * @throws {Error} If either password1 or password2 is not provided.
 *
 * @returns {boolean} `true` if the password was successfully set, `false`
 *     otherwise.
 */
function setJXAppPassword(password1, password2) {
  if (password1 === undefined || password2 === undefined) throw new Error("Go away.");
  var result = false;
  if (getSetting_("password") !== null) {
    if (getSetting_("password") === password1) {
      result = true;
    }
  } else {
    result = true;
  }
  return result ? setSetting_("password", password2.toString()) : false;
}


/**
 * Retrieves a specified setting from the script properties. If the setting is
 * not found, returns null.
 *
 * @name private_
 * @param {string} property The name of the setting to retrieve.
 *
 * @return {any} The value of the specified setting, or `null` if the setting
 *     does not exist.
 */
function getSetting_(property) {
  const properties = PropertiesService.getScriptProperties();
  const settings = JSON.parse(properties.getProperty("SETTINGS")) || {};
  return settings.hasOwnProperty(property) ? settings[property] : null;
}


/**
 * Sets a specified setting in the script properties to the given value.
 *
 * @name private_
 * @param {string} property The name of the setting to update.
 * @param {any} value The value to set for the specified setting.
 *
 * @return {boolean} `true` if the setting was updated successfully, otherwise
 *     `false` if an error occurred.
 */
function setSetting_(property, value) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var settings = JSON.parse(properties.getProperty("SETTINGS")) || {};
    var upSettings = JSON.parse(JSON.stringify(settings));
    upSettings[property] = value;
    properties.setProperty("SETTINGS", JSON.stringify(upSettings));
  } catch (e) {
    LE(e);
    return false;
  }

  return true;
}


/**
 * Sets a specified value in the script cache with the given property key.
 *
 * @name private_
 * @param {string} property The key of the value to set in the cache.
 * @param {any} value The value to set in the cache.
 *
 * @return {boolean} `true` if the value was set in the cache successfully,
 *     otherwise `false` if an error occurred.
 */
function setCache_(property, value) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var settings = JSON.parse(properties.getProperty("CACHE")) || {};
    var upSettings = JSON.parse(JSON.stringify(settings));
    upSettings[property] = value;
    properties.setProperty("CACHE", JSON.stringify(upSettings));
  } catch (e) {
    LE(e);
    return false;
  }

  return true;
}


/**
 * Sets a specified property in the script properties to the given value.
 *
 * @name private_
 * @param {string} property The name of the property to set.
 * @param {any} value The value to set for the specified property.
 *
 * @return {boolean} `true` if the property was set successfully, `false`
 *     otherwise.
 */
function setProp_(property, value) {
  try {
    var properties = PropertiesService.getScriptProperties();
    properties.setProperty(property, JSON.stringify(value));
  } catch (e) {
    LE(e);
    return false;
  }

  return true;
}

