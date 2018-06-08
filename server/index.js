let express = require('express');

let app = express();

let db = require("./db");

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

let port = process.env.PORT || 3200;

if (require.main === module) {
  app.listen(port, () => {
    console.log('Listening on port ' + port);
  });
}
