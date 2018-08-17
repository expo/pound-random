let assert = require('assert');
let moment = require('moment');
let db = require('./db');
let typedError = require('./typedError');

async function multigetObjectsAsync(idList, table, opts) {
  opts = opts || {};
  let column = opts.column || table + 'Id';
  let results = await db.queryAsync(
    'SELECT * FROM ' +
      table +
      ' WHERE ' +
      column +
      ' IN (' +
      idList.map(() => '?').join(', ') +
      ');',
    idList
  );
  let x = {};

  // Put in nulls so we know what things were missing
  for (let id of idList) {
    x[id] = null;
  }

  for (let r of results) {
    let obj = Object.assign({}, r);
    let id = obj[column];
    x[id] = obj;
  }
  return x;
}

function objectsFromResults(results, key) {
  let x = {};
  for (let r of results) {
    let obj = Object.assign({}, r);
    let id = obj[key];
    x[id] = obj;
  }
  return x;
}

function objectsListFromResults(results) {
  let x = [];
  for (let r of results) {
    let obj = Object.assign({}, r);
    x.push(obj);
  }
  return x;
}

async function getObjectAsync(id, table, opts) {
  table = table || id.replace(/:.*$/, '');
  let x = await multigetObjectsAsync([id], table, opts);
  return x[id];
}

async function writeNewObjectAsync(obj, table, opts) {
  let o = { ...obj };
  let t = moment().format('YYYY-MM-DD HH:mm:ss');
  opts = opts || {};
  o.updatedTime = o.updatedTime || t;
  o.createdTime = o.createdTime || t;
  let keys = Object.keys(o);
  let fields = keys.map((x) => '`' + x + '`').join(', ');
  let values = [];
  for (let k of keys) {
    values.push(o[k]);
  }
  let verb = 'INSERT';
  if (opts.replace) {
    verb = 'REPLACE';
  }
  await db.queryAsync(
    verb + ' INTO ' + table + '(' + fields + ') VALUES (' + keys.map(() => '?').join(', ') + ')',
    values
  );
  return o;
}

async function updateObjectAsync(id, table, update, opts) {
  let o = { ...update };
  opts = opts || {};
  let column = opts.column || table + 'Id';
  o.updatedTime = o.updatedTime || moment().format('YYYY-MM-DD HH:mm:ss');
  let keys = Object.keys(update);
  let values = [];
  for (let k of keys) {
    values.push(update[k]);
  }
  let updates = keys.map((k) => '`' + k + '` = ?').join(', ');
  let q = 'UPDATE ' + table + ' SET ' + updates + ' WHERE `' + column + '` = ?;';
  values.push(id);
  let result = await db.queryAsync(q, values);
  assert.equal(result.affectedRows, 1);
}

module.exports = {
  getObjectAsync,
  multigetObjectsAsync,
  writeNewObjectAsync,
  updateObjectAsync,
  objectsFromResults,
  objectsListFromResults,
};
