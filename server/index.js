let express = require('express');

let bodyParser = require("body-parser");


let db = require("./db");
let api = require("./api");

let app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello #random!");
});

app.get("/select", (req, res) => {
  (async () => {
    let results = await db.queryAsync("SELECT 42 AS result");
    res.send("The result from the database was " + results[0].result);
  })();
});

app.get("/fake_posts", (req, res) => {
  (async () => {
    let results = await db.queryAsync("SELECT * FROM fake_posts");
    res.send(results);
  })();
});

async function apiAsync(req, res) {
  let userId = "user:api";
  let method = req.params.method;
  let args = req.body;
  // TODO: Add a warning if you use both the URL and body for args
  if (!args) {
    args = [req.params.a, req.params.b, req.params.c, req.params.d, req.params.e, req.params.f, req.params.g];
  }
  let context = {userId};
  try {
    let result = await api.callMethodAsync(context, method, args);
    res.json(result);
  } catch (err) {
    res.status(500).render("API_ERROR", {error: err});
    res.end();
  }
}


app.all("/call/:method", apiAsync);
app.all("/call/:method/:a", apiAsync);
app.all("/call/:method/:a/:b", apiAsync);
app.all("/call/:method/:a/:b/:c", apiAsync);
app.all("/call/:method/:a/:b/:c/:d", apiAsync);
app.all("/call/:method/:a/:b/:c/:d/:e", apiAsync);
app.all("/call/:method/:a/:b/:c/:d/:e/:f", apiAsync);
app.all("/call/:method/:a/:b/:c/:d/:e/:f/:g", apiAsync);

let port = process.env.PORT || 3200;

if (require.main === module) {
  app.listen(port, () => {
    console.log('Listening on port ' + port);
  });
}
