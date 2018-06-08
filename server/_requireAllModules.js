let fs = require("fs");

function getModules() {
  let files = fs.readdirSync(__dirname);
  let modules = [];
  for (let i = 0; i < files.length; i++) {
    let f = files[i];
    if (f.endsWith(".js")) {
      modules.push(f.substr(0, f.length - 3));
    }
  }
  return modules;
}

function startupCommand() {
  let ms = getModules();
  let s = [];
  for (let i = 0; i < ms.length; i++) {
    // TODO: Do transformation if dashes or anything
    let m = ms[i];
    s.push('let ' + m + ' = require("./' + m + '");');
  }
  //s.push('console.log("\\nImported:\\n  ' + ms.join('\\n  ') + '\\n\\n");');
  return s.join(" ");
}

function requireModules() {
  console.log();
  let ms = getModules();
  for (let i = 0; i < ms.length; i++) {
    let m = ms[i];
    if (m !== "_requireAllModules") {
      console.log("Importing " + m + "...");
      global[m] = require("./" + m);
    }
  }
  process.stdout.write("> ");
}

requireModules();

module.exports = {
  getModules,
  requireModules,
}
