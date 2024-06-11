/**
 * Enables automatic updates for the "stable" version of the JDBCX script.
 *
 * This function creates a time-based trigger that runs
 * the `t_updateStable()` function every 14 days at 7 AM.
 */
function updatesEnable_STABLE() {
  validateSession_();
  updatesDisable(false);
  var trigger = ScriptApp.newTrigger("t_updateStable_").timeBased()
    .everyDays(14).atHour(7)
    .create().getUniqueId();
  if (trigger)
    setSetting_("updates", trigger);
}


/**
 * Enables automatic updates for the "beta" version of the JDBCX script.
 *
 * This function creates a time-based trigger that runs
 * the `t_updateBeta()` function every 7 days at 7 AM.
 */
function updatesEnable_BETA() {
  validateSession_();
  updatesDisable(false);
  var trigger = ScriptApp.newTrigger("t_updateBeta_").timeBased()
    .everyDays(7).atHour(7)
    .create().getUniqueId();
  if (trigger)
    setSetting_("updates", trigger);
}


/**
 * Disables the automatic updates for the JDBCX script (deployment).
 */
function updatesDisable(noCheck) {
  noCheck = noCheck !== false;
  if (noCheck) validateSession_();
  var trigger = getSetting_("updates");
  if (trigger !== null) {
    deleteTrigger_(trigger);
    setSetting_("updates");
  }
}


/**
 * Deletes the specified trigger from the project.
 * @name _
 * @param {string} triggerUid The unique ID of the trigger to be deleted.
 */
function deleteTrigger_(triggerUid) {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getUniqueId() === triggerUid)
      ScriptApp.deleteTrigger(t);
  });
}


/**
 * Deletes all the project triggers.
 * @name _
 */
function deleteTriggers_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}


/**
 * Updates the "stable" version of the JDBCX script.
 *
 * Calls the `update JDBCX()` function and provides
 * the script ID for the "stable" version of the JDBCX script.
 * @name _
 */
function t_updateStable_() {
  updateJDBCX_("1AMYNAA96kZTenVVNqjDXtyZx7h6PcQHIbFvnt1TxqbHIuqBbLbmMQk7l");
}


/**
 * Updates the "beta" version of the JDBCX script.
 *
 * Calls the `update JDBCX()` function and provides
 * the script ID for the "beta" version of the JDBCX script.
 * @name _
 */
function t_updateBeta_() {
  // DO NOT USE IT FOR WORK.
  updateJDBCX_("12op77x7GYSsm0F17Vl4qZv1qTMc4eXp_096FmgtGva4bR8Nq59kJXzXG");
}


/**
 * Updates the JDBCX script.
 * @name _
 * @param {string} script_id The ID of the script to be updated.
 * @throws {Error} If the script ID is not defined.
 */
function updateJDBCX_(script_id) {
  if (!script_id) throw new Error('Script ID is not defined.');

  var updater = ScriptSync5.assignTemplate(script_id);
  var match = updater.compareFilesByContent("WhatsNew", "WhatsNew");

  if (match !== true) {

    var filesToCopy = ScriptSync5.getScriptFiles(script_id);
    
    filesToCopy.forEach(function(item) {
      if (item.file !== 'appsscript') {
        updater.AddNewFile(item.file);
      }
    });
    updater.deleteFile("version_history");

    if (updater.result) {
      var status = updater.commit();
      if (status) {
        notifyUpdates();
        setPropUpdated_();
      } else {
        console.error(
          "Updates available, but an error was found when copying. " +
          "The deployment has not been updated.");
      }
    }
  }
}


/**
 * Notifies the user about the successful update of the JDBCX script.
 * @name _
 */
function notifyUpdates() {
  console.log("Your JDBCX deployment has been successfully updated.");
  console.warn("Please republish your WebApp & Library and Update its URL " +
               "using the \'setJXAppURL\' method.");
}


/**
 * Checks the call stack to ensure that the function is being called
 * from the current deployment, not the user script.
 * Also checks if the active user is the owner of the script.
 *
 * @throws {Error} If the function is not being called from the deployment
 *      or if the user is not the owner.
 */
function validateSession_() {
  try {
    throw new Error();
  } catch (e) {
    var s = e.stack.split('\n');
    if (s.length > 3) throw new ValidationError(
      'You need to run this function from your deployment directly.'
    );
  }
  var scriptId = ScriptApp.getScriptId();
  if (Session.getActiveUser().getEmail() !== DriveApp.getFileById(scriptId).getOwner().getEmail()) {
    throw new ValidationError('This function can only be run by the owner.');
  }
}

