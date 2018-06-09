let express = require('express');

let bodyParser = require("body-parser");

let data = require("./data");
let db = require("./db");
let api = require("./api");

let app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello #random!");
});

async function apiAsync(req, res) {
  let method = req.params.method;
  let args = req.body;

  let token = req.header("X-PoundRandom-Auth-Token");
  let userId = null;
  if (token) {
    userId = await data.userForTokenAsync(token);
    if (!userId) {
      console.warn("No session for auth token: " + token);
    }
  }

  // If you use request parameters, then we ignore the body
  if (req.params.a) {
    args = [req.params.a, req.params.b, req.params.c, req.params.d, req.params.e, req.params.f, req.params.g];
  }
  let context = {userId};
  let callsig = "[" + (context.userId || "") + "]" + method + JSON.stringify(args).replace(/^./,"(").replace(/.$/,")");
  console.log("API: " + callsig);
  try {
    let result = await api.callMethodAsync(context, method, args);
    res.json(result);
  } catch (err) {
    console.error("API Error: " + callsig + " Error: " + err);
    res.status(500).send({
       message: "API Error: " + err,
    });
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

if (require.main === module) {
  app.listen(port, () => {
    console.log('Listening on port ' + port);
  });
}
