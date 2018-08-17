let fs = require("fs").promises;

let pkg = require("./package.json");

let IGNORE_FILES = {};
let IGNORE_MODULES = {};
(() => {
  let bfiles = (pkg.repl && pkg.repl.ignore && pkg.repl.ignore.files) || [];
  for (let bf of bfiles) {
    IGNORE_FILES[bf] = true;
  }

  let bmodules = (pkg.repl && pkg.repl.ignore && pkg.repl.ignore.modules) || [];
  for (let bm of bmodules) {
    IGNORE_MODULES[bm] = true;
  }
})();

function varNameForModule(m) {
  let v = "";
  let capNext = false;
  for (let c of m) {
    switch (c) {
      case "-":
        capNext = true;
        break;
      case ".":
        break;
      case "/":
        v = "";
        capNext = false;
        break;
      default:
        if (capNext) {
          v += c.toUpperCase();
        } else {
          v += c;
        }
        capNext = false;
        break;
    }
  }
  return v;
}

async function getModulesAsync() {
  let files = await fs.readdir(__dirname);
  let modules = [];
  for (let i = 0; i < files.length; i++) {
    let f = files[i];
    if (f.endsWith(".js")) {
      modules.push(f.substr(0, f.length - 3));
    }
  }
  return modules;
}

async function isDirAsync(p) {
  let st = await fs.stat(p);
  return st.isDirectory();
}

async function recursiveScanDirAsync(dir, acc) {
  let files = await fs.readdir(dir);

  for (let f of files) {
    if (IGNORE_FILES.hasOwnProperty(f)) {
      continue;
    }

    let p = path.join(dir, f);

    if (await isDirAsync(p)) {
      await recursiveScanDirAsync(p, acc);
    } else if (f.endsWith(".js")) {
      let v = f.substr(0, f.length - 3);
      let fp = path.join(dir, f);

      if (v === "index") {
        let p = path.parse(dir);
        v = p.name;
        fp = dir;
      }

      if (acc.hasOwnProperty(v)) {
        throw new Error(
          "Duplicate module name: " + v + " at " + fp + " and " + acc[v]
        );
      } else {
        acc[v] = fp;
      }
    } else {
      // Some other kind of file; nothing to do
    }
  }
  return acc;
}

async function recursiveRequireModulesAsync() {
  let startTime = Date.now();
  let pkg = require("./package.json");

  let depsMap = { ...pkg.dependencies };
  let devDepsMap = { ...pkg.devDependencies };
  for (let bm in IGNORE_MODULES) {
    delete depsMap[bm];
    delete devDepsMap[bm];
  }
  let deps = Object.keys(depsMap);
  let devDeps = Object.keys(devDepsMap);

  // Load deps before devDeps since that's what will happen in production and we
  // don't want devDeps masking the time cost of deps by loading some of their
  // dependencies in advance (though this can happen with other deps too...)
  let allDeps = [].concat(deps, devDeps);

  let depTimes = {};
  for (let name of allDeps) {
    let depTimeStart = Date.now();
    global[varNameForModule(name)] = require(name);
    let depTimeEnd = Date.now();
    let dt = depTimeEnd - depTimeStart;
    depTimes[name] = dt;
  }

  let allModules = await recursiveScanDirAsync(__dirname, {});
  let appCodeStart = Date.now();
  for (let name in allModules) {
    let mp = allModules[name];
    let sp = "." + mp.substr(__dirname.length);
    // console.log("Importing " + name + gray(" " + sp + ""));
    global[varNameForModule(name)] = require(allModules[name]);
  }
  let endTime = Date.now();
  let appCodeTime = endTime - appCodeStart;
  let t = endTime - startTime;
  let mn = Object.keys(allModules);
  mn.sort();

  // Sort the deps by time taken to require them
  let sortable = [];
  for (let name of allDeps) {
    sortable.push([name, depTimes[name]]);
  }
  sortable.sort((a, b) => {
    return b[1] - a[1];
  });
  let disp = [];
  for (let [name, t] of sortable) {
    disp.push(name + "(" + t + "ms)");
  }

  console.log(
    mn.length +
      " modules and " +
      allDeps.length +
      " npm modules required in " +
      t +
      "ms"
  );
  console.log(disp.join(" "));
  console.log(mn.join(" ") + " (" + appCodeTime + "ms combined)");
  process.stdout.write("> ");
}

// recursiveRequireModulesAsync();

module.exports = {
  getModulesAsync,
  recursiveScanDirAsync,
  isDirAsync,
  recursiveRequireModulesAsync,
  varNameForModule
};
