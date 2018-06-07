let secret = require('../../pound-random-secret');
let mysql = require('mysql');

let conn = mysql.createConnection(secret.database);
conn.connect();

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
        results.fields = fields;
        resolve(results);
      }
    });
  });
}

function mysqlCommand() {
  let conf = secret.database;
  return "mysql -h" + conf.host + " -u" + conf.user + " -p" + conf.password + " " + conf.database;
}

module.exports = {
  queryAsync,
  mysqlCommand,
  _conn: conn,
  connect,
  disconnect,
};
