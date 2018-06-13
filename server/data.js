let db = require("./db")
let typedError = require("./typedError");

// async function getUserByIdAsync(userId) {
//   let result = await db.queryAsync("SELECT userId, normalizedUsername, displayUsername, email, emailConfirmed, mobileNumber, mobileNumberConfirmed, hashedPassword, createdTime, updatedTime FROM user WHERE userId = ?", [userId]);
//   if (result.length < 1) {
//     throw new typedError("NOT_FOUND", "No user found for userId " + userId);
//   }
//   // Make it just a plain JS object
//   return { ...result[0] };
// }

// async function addUserAsync(user) {
//   let u = { ...user };
//   u.createdTime = u.createdTime || new Date();
//   let result = await db.queryAsync("INSERT INTO user (userId, normalizedUsername, displayUsername, email, emailConfirmed, mobileNumber, mobileNumberConfirmed, hashedPassword, createdTime, updatedTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [u.userId, u.normalizedUsername, u.displayUsername, u.email, u.emailConfirmed, u.mobileNumber, u.mobileNumberConfirmed, u.hashedPassword, u.createdTime || new Date(), u.updatedTime || new Date()]);
//   return u.userId;
// }


// async function getObjectAsync(id, table, opts) {
//   table = table || id.replace(/:.*$/, "");
//   opts = opts || {};
//   let column = opts.column || table + "Id";
//   let results = await db.queryAsync("SELECT * FROM " + table + " WHERE " + column + " = ?", [id]);
//   if (results.length === 1) {
//     return Object.assign({}, results[0]);
//   }
// }

async function multigetObjectsAsync(idList, table, opts) {
  opts = opts || {};
  let column = opts.column || table + "Id";
  let results = await db.queryAsync("SELECT * FROM " + table + " WHERE " + column + " IN (" + idList.map(() => '?').join(", ") + ");", idList);
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

async function getObjectAsync(id, table, opts) {
  table = table || id.replace(/:.*$/, "");
  let x = await getObjectsAsync([id], table, opts);
  return x[id];
}

async function writeNewObjectAsync(obj, table, opts) {
  let o = {...obj};
  let t = new Date();
  o.updatedTime = o.updatedTime || t;
  o.createdTime = o.createdTime || t;
  let keys = Object.keys(o);
  let fields = keys.map((x) => '`' + x + '`').join(", ");
  let values = [];
  for (let k of keys) {
    values.push(o[k]);
  }
  await db.queryAsync("INSERT INTO " + table + "(" + fields + ") VALUES (" + keys.map(() => "?").join(", ") + ")", values);
}

async function updateObjectAsync(id, table, opts, update) {
  let o = {...obj};
  let opts = opts || {};
  let column = opts.column;
  o.updatedTime = o.updatedTime || new Date();
  let keys = Object.keys(update);
  let updates = keys.map((k) => ("`" + k + "` = ?")).join(", ")
  await db.queryAsync("UPDATE " + table + " SET " + updates + " WHERE `" + column + "` = " + id + ";");
  return;
}

module.exports = {
  getObjectAsync,
  multigetObjectsAsync,
  writeNewObjectAsync,
  updateObjectAsync,
};
