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

