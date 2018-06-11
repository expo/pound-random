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
  let result = await db.queryAsync("INSERT INTO user (userId, noramlizedUsername, displayUsername, email, emailConfirmed, mobileNumber, mobileNumberConfirmed, hashedPassword, createdTime, updatedTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [u.userId, u.normalizedUsername, u.displayUsername,u.email, u.emailConfirmed, u.mobileNumber, u.mobileNumberConfirmed, u.hashedPassword, u.createdTime || new Date(), u.updatedTime || new Date()]);
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

async function userIdForUsernameAsync(username) {
  let result = await db.queryAsync("SELECT userId FROM user WHERE username = ?", [username]);
  if (result.length > 0) {
    return result[0].user_id;
  }
}

module.exports = {
  getUserByIdAsync,
  addUserAsync,
  createSessionAsync,
  deleteSessionAsync,
  userForTokenAsync,
  userIdForUsernameAsync,
};
