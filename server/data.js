let assert = require("assert");

let db = require("./db")
let typedError = require("./typedError");

async function getUserByIdAsync(userId) {
  let result = await db.queryAsync("SELECT user_id, username, password, email, date_created FROM user WHERE user_id = ?", [userId]);
  if (result.length < 1) {
    throw new typedError("NOT_FOUND", "No user found for userId " + userId);
  }
  // Make it just a plain JS object
  return {...result[0]};
}

module.exports = {
  getUserByIdAsync,
};
