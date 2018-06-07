let secret = require('../../pound-random-secret');
let mysql = require('mysql');

let conn = mysql.createConnection(secret.database);

// TODO: Maybe don't connect here?
// Should probably lazily do this
connect();

function connect() {
  conn.connect();
}

function disconnect() {
  conn.end();
}

async function queryAsync(q) {
  return new Promise((resolve, reject) => {
    conn.query(q, (err, results, fields) => {
      // TODO: Do we want to do anything with fields?
      if (err) {
        reject(err);
      } else {
        //results.fields = fields;
        resolve(results);
      }
    });
  });
}

module.exports = {
  queryAsync,
  _conn: conn,
  connect,
  disconnect,
};
