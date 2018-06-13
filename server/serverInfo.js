let fs = require("fs").promises;
let path = require("path");

let ip = require("ip");

async function writeServerInfoAsync() {
  let data = { lanIpAddress: ip.address() };
  await fs.writeFile(path.join(__dirname, "..", "pound-random-app", "serverInfo-generated.json"), JSON.stringify(data), "utf8");
}

module.exports = {
  writeServerInfoAsync,
}
