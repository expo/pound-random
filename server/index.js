let express = require("express");
let app = express();

app.get("/", (req, res) => {
  res.send("Hello #random!");
});

let port = process.env.PORT || 3200;

app.listen(port, () => {
  console.log('Example app listening on port ' + port);
});
