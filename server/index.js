let util = require("util");

let bodyParser = require("body-parser");
let express = require("express");
let ip = require("ip");
let moment = require("moment");
let qrcodeTerminal = require("qrcode-terminal");
let qrcode = require("qrcode");

let clientError = require("./clientError");
let data = require("./data");
let api = require("./api");
let session = require("./session");

let app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello #random!");
});

let _apiStats = {
  requests: 0,
  success: 0,
  apiError: 0,
  serverError: 0,
  // clientError: 0,
}

async function apiAsync(req, res) {
  let method = req.params.method;
  let args = req.body;
  _apiStats.requests += 1;

  let token = req.header("X-PoundRandom-Auth-Token");
  let userId = null;
  if (token) {
    userId = await session.userIdForTokenAsync(token);
    if (!userId) {
      console.warn("No session for auth token: " + token);
    }
  }

  // If you use request parameters, then we ignore the body
  if (req.params.a) {
    args = [req.params.a, req.params.b, req.params.c, req.params.d, req.params.e, req.params.f, req.params.g];
  }
  let context = { userId, token };
  let callsig = "[" + (context.userId || "") + "]" + method + JSON.stringify(args).replace(/^./, "(").replace(/.$/, ")");
  console.log("API: " + callsig);
  try {
    let result = await api.callMethodAsync(context, method, args);
    _apiStats.success += 1;
    res.json(result);
  } catch (err) {
    if (err && err.type === "API_ERROR") {
      _apiStats.apiError += 1;
      res.status(400);
      res.json({
        BAD_REQUEST: true,
        message: err.message,
      });
    }
    if (clientError.isClientError(err)) {
      res.status(520);
      // _apiStats.clientError += 1;
      // clientErrors count as success since it just means everything is functioning normally
      _apiStats.success += 1;
      res.json({
        CLIENT_ERROR: true,
        code: err.code,
        message: err.message,
        props: err.props,
      });
    } else {
      console.error("API Error: " + callsig + "\n" + util.inspect(err));
      _apiStats.serverError += 1;
      res.status(500).send({
        message: "API Error: " + err,
      });
    }
  }
}

// Handle up to 7 parameters specified via the URL
app.all("/api/:method", apiAsync);
app.all("/api/:method/:a", apiAsync);
app.all("/api/:method/:a/:b", apiAsync);
app.all("/api/:method/:a/:b/:c", apiAsync);
app.all("/api/:method/:a/:b/:c/:d", apiAsync);
app.all("/api/:method/:a/:b/:c/:d/:e", apiAsync);
app.all("/api/:method/:a/:b/:c/:d/:e/:f", apiAsync);
app.all("/api/:method/:a/:b/:c/:d/:e/:f/:g", apiAsync);

let port = process.env.PORT || 3200;

function getMyLanUrl() {
  let addr = ip.address();
  let lanUrl = "http://" + addr;
  if (port !== 80) {
    lanUrl += ":" + port;
  }
  lanUrl += "/";
  return lanUrl;
}

app.get("/--/health", (req, res) => {
  res.status(200);
  res.send("OK");
});

app.get("/--/status", (req, res) => {
  (async () => {

    res.status(200);
    let lanUrl = getMyLanUrl();
    let dataUrl = await qrcode.toDataURL(lanUrl);
    let apiDoc = await api.shellCallMethodAsync("__doc__");
    let methods = Object.keys(apiDoc);
    methods = methods.sort();
    let now = Date.now();
    let uptime = now - _apiStats.startTime;
    let rps = _apiStats.requests / (uptime / 1000);
    let z = `
<html>
  <head>
    <title>#random Server Status Page</title>
  </head>
  <body style="font-family: monospace;">
    <h3>Server LAN URL</h3>
    <p>${lanUrl}</p>
    <img src="${dataUrl}" />
    <hr />
    <h3> Status</h3>
    <p>OK</p>
    <p>Started ${moment(_apiStats.startTime).fromNow()}<br />at ${moment(_apiStats.startTime).format()}</p>
    <hr />
    <h3>Stats</h3>
    <table>
      <tr><td>Requests</td><td>${_apiStats.requests}</td></tr>
      <tr><td>Success</td><td>${_apiStats.success}</td></tr>
      <tr><td>API Errors</td><td>${_apiStats.apiError}</td></tr>
      <tr><td>Server Errors</td><td>${_apiStats.serverError}</td></tr>
      <tr><td>Total Errors</td><td>${_apiStats.serverError + _apiStats.apiError}</td></tr>
    </table>
    <p>${rps} requests per second.</p>
  </body>
</html>
`;
    res.send(z);
  })();
});


if (require.main === module) {
  app.listen(port, () => {
    console.log('Listening on port ' + port);
    let lanUrl = getMyLanUrl();
    let statusUrl = lanUrl + "--/status";
    console.log("Status at " + statusUrl);
    console.log();
    _apiStats.startTime = Date.now();
    console.log(lanUrl);
    if (process.stdout.isTTY) {
      qrcodeTerminal.generate(lanUrl);
    }
  });
}
