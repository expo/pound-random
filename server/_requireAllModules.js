let fs = require("fs").promises;

function gray(x) {
  return '\u001b[90m' + x + '\u001b[39m';
}

function varNameForModule(m) {
  let v = "";
  let capNext = false;
  for (let c of m) {
    switch (c) {
      case '-':
        capNext = true;
        break;
      case '.':
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

    let blacklist = {
      "node_modules": true,
      ".git": true,
      // "_requireAllModules.js": true,
    }
    if (blacklist.hasOwnProperty(f)) {
      continue;
    }

    let p = path.join(dir, f);

    if (await isDirAsync(p)) {
      await recursiveScanDirAsync(p, acc);
    } else if (f.endsWith(".js")) {
      let v = f.substr(0, f.length - 3);
      let fp = path.join(dir, f);

      if (v === 'index') {
        let p = path.parse(dir);
        v = p.name;
        fp = dir;
      }

      if (acc.hasOwnProperty(v)) {
        throw new Error("Duplicate module name: " + v + " at " + fp + " and " + acc[v]);
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
  let deps = Object.keys(pkg.dependencies || {});
  let devDeps = []; // Object.keys(pkg.devDependencies || {});
  let allDeps = [].concat(devDeps, deps).sort();
  for (let name of allDeps) {
    global[varNameForModule(name)] = require(name);
  }
  
  let allModules = await recursiveScanDirAsync(__dirname, {});
  for (let name in allModules) {
    let mp = allModules[name];
    let sp = "." + mp.substr(__dirname.length);
    // console.log("Importing " + name + gray(" " + sp + ""));
    global[varNameForModule(name)] = require(allModules[name]);
  }
  let endTime = Date.now();
  let t = endTime - startTime;
  let mn = Object.keys(allModules);
  mn.sort();
  console.log(mn.length + " modules and " + allDeps.length + " npm modules required in " + t + "ms");
  console.log(allDeps.join(" "));
  console.log(mn.join(" "));
  process.stdout.write("> ");
}

// recursiveRequireModulesAsync();

module.exports = {
  getModulesAsync,
  recursiveScanDirAsync,
  isDirAsync,
  recursiveRequireModulesAsync,
  gray,
  varNameForModule,
}
