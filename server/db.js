let mysql = require('mysql');

let secret = require('./secret');
let time = require('./time');

let conn = mysql.createConnection({
  charset: 'utf8mb4_unicode_ci'.toUpperCase(),
  ...secret.database,
});
conn.connect();

setInterval(function() {
  conn.query('SELECT 1');
}, 5000);

function _connected() {
  return conn && conn.state === 'connected';
}

function _connect() {
  if (_connected()) {
    return false;
  } else {
    conn = mysql.createConnection({
      charset: 'utf8mb4_unicode_ci'.toUpperCase(),
      ...secret.database,
    });
    conn.connect();

    return true;
  }
}

function _disconnect() {
  if (connected()) {
    conn.end();
    return true;
  } else {
    return false;
  }
}

function fieldNamesForResults(results) {
  let fields = results.fields;
  let fieldNames = [];
  for (let f of fields) {
    fieldNames.push(f.name);
  }
  return fieldNames;
}

async function queryAsync(q, ...rest) {
  let qtid = 'db-query-' + ('' + Math.random()).substr(2, 6);
  time.start(qtid);

  return new Promise((resolve, reject) => {
    time.start(qtid + '-connect');
    _connect();
    time.end(qtid + '-connect', 'db-connect', { threshold: 10 });
    conn.query(q, ...rest, (err, results, fields) => {
      // TODO: Do we want to do anything with fields?
      if (err) {
        time.end(qtid, '(ERROR) ' + q);
        reject(err);
      } else {
        //results.fields = fields;
        time.end(qtid, 'db-query', q);
        results.fields = fields;
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
  fieldNamesForResults,
};
