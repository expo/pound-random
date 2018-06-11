let mysql = require('mysql');

let _connected = false;
let conn = null;

function databaseInfo() {
  try {
    return require('../../pound-random-secret').database;
  } catch (e) {
    return require("/etc/secrets/pound-random-database");
  }
}

let _databaseInfo = databaseInfo();

function _connect() {
  if (_connected) {
    return false;
  } else {
    conn = mysql.createConnection(_databaseInfo);
    conn.connect();
    _connected = true;
    return true;
  }
}

function _disconnect() {
  if (_connected) {
    conn.end();
    _connected = false;
    return true;
  } else {
    return false;
  }
}

async function queryAsync(q, ...rest) {
  return new Promise((resolve, reject) => {
    _connect();
    conn.query(q, ...rest, (err, results, fields) => {
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
  _connect,
  _disconnect,
  _connected,
};
