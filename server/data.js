let db = require("./db")
let typedError = require("./typedError");

async function getUserByIdAsync(userId) {
  let result = await db.queryAsync("SELECT userId, normalizedUsername, displayUsername, email, emailConfirmed, mobileNumber, mobileNumberConfirmed, hashedPassword, createdTime, updatedTime FROM user WHERE userId = ?", [userId]);
  if (result.length < 1) {
    throw new typedError("NOT_FOUND", "No user found for userId " + userId);
  }
  // Make it just a plain JS object
  return {...result[0]};
}

async function addUserAsync(user) {
  let u = {...user};
  u.createdTime = u.createdTime || new Date();
  let result = await db.queryAsync("INSERT INTO user (userId, normalizedUsername, displayUsername, email, emailConfirmed, mobileNumber, mobileNumberConfirmed, hashedPassword, createdTime, updatedTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [u.userId, u.normalizedUsername, u.displayUsername,u.email, u.emailConfirmed, u.mobileNumber, u.mobileNumberConfirmed, u.hashedPassword, u.createdTime || new Date(), u.updatedTime || new Date()]);
  return u.userId;
}

async function createSessionAsync(userId, token) {
  let result = await db.queryAsync("INSERT INTO session (userId, token, createdTime, updatedTime) VALUES (?, ?, ?, ?)", [userId, token, new Date(), new Date()]);
  return token;
}

async function deleteSessionAsync(token) {
  await db.queryAsync("DELETE FROM session WHERE token = ?", [token]);
}

async function userForTokenAsync(token) {
  let result = await db.queryAsync("SELECT userId FROM session WHERE token = ?", [token]);
  if (result.length > 0) {
    return result[0].user_id;
  }
}

async function userIdForNormalizedUsernameAsync(normalizedUsername) {
  let result = await db.queryAsync("SELECT userId FROM user WHERE normalizedUsername = ?", [normalizedUsername]);
  if (result.length > 0) {
    return result[0].user_id;
  }
}

async function getObjectAsync(id, table, opts) {
  table = table || id.replace(/:.*$/, "");
  opts = opts || {};
  let column = opts.column || table + "Id";
  let results = await db.queryAsync("SELECT * FROM " + table + " WHERE " + column + " = ?", [id]);
  if (results.length === 1) {
    return Object.assign({}, results[0]);
  }
}

async function getObjectsAsync(idList, table, opts) {
  opts = opts || {};
  let column = opts.column || table + "Id";
  idList.map
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

module.exports = {
  getObjectsAsync,
  getUserByIdAsync,
  addUserAsync,
  createSessionAsync,
  deleteSessionAsync,
  userForTokenAsync,
  userIdForNormalizedUsernameAsync,
  getObjectAsync,
};
