let db = require("./db")
let typedError = require("./typedError");

async function getUserByIdAsync(userId) {
  let result = await db.queryAsync("SELECT user_id, username, password, email, date_created FROM users WHERE user_id = ?", [userId]);
  if (result.length < 1) {
    throw new typedError("NOT_FOUND", "No user found for userId " + userId);
  }
  // Make it just a plain JS object
  return {...result[0]};
}

async function addUserAsync(user) {
  let u = {...user};
  u.date_created = u.date_created || Date.now();
  let result = await db.queryAsync("INSERT INTO users (user_id, username, display_username, mobile_number, password, email, date_created) VALUES (?, ?, ?, ?, ?)", [u.user_id, u.username, u.display_username, u.mobile_number, u.password, u.email, u.date_created]);
  return u.user_id;
}

async function createSessionAsync(userId, token) {
  let result = await db.queryAsync("INSERT INTO sessions (user_id, token, created_time) VALUES (?, ?, ?)", [userId, token, Date.now()]);
  return token;
}

async function deleteSessionAsync(token) {
  await db.queryAsync("DELETE FROM sessions WHERE token = ?", [token]);
}

async function userForTokenAsync(token) {
  let result = await db.queryAsync("SELECT user_id FROM sessions WHERE token = ?", [token]);
  if (result.length > 0) {
    return result[0].user_id;
  }
}

async function userIdForUsernameAsync(username) {
  let result = await db.queryAsync("SELECT user_id FROM users WHERE username = ?", [username]);
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
