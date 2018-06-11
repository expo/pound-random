let clientError = require("./clientError");
let compactUuid = require("./compactUuid");
let data = require("./data");
let db = require("./db");
let session = require("./session");

USERNAME_REGEX = /^[a-zA-Z0-9\.-_]*$/;
USERNAME_MIN_LENGTH = 2;
USERNAME_MAX_LENGTH = 80;

function validateUsername(username) {
  return (
    USERNAME_REGEX.test(username) && 
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH
  );
}

function normalizeUsername(username) {
  return username.toLowerCase().replace(".", "").replace("-", "_");
}

async function userIdExistsAsync(userId) {
  let result = await db.queryAsync("SELECT user_id FROM users WHERE user_id = ?", [userId]);
  return (result.length > 0);
}

async function makeUserIdForUsernameAsync(username) {
  let x = "user:" + username;
  // Yes this is susceptible to race conditions
  while (true) {
    if (await userIdExistsAsync(x)) {
      x += "+" + compactUuid.makeUuid();
    } else {
      break;
    }
  }
  return x;
}

async function writeSignupAsync(userId, username, displayUsername, mobileNumber) {
  await db.queryAsync("INSERT INTO users (user_id, username, display_username, mobile_number, date_created) VALUES (?, ?, ?, ?, ?)", [userId, username, displayUsername, mobileNumber, new Date()]);
}

async function signupUserAsync(username, mobileNumber) {
  // Check to see if this user exists already (yes there is a race condition
  // that could happen here; we still need to check for failed writes)

  if (!validateUsername(username)) {
    throw clientError("INVALID_USERNAME", "Invalid username '" + username + "'. Usernames must be between 2 and 80 characters and only contain [a-zA-Z0-9.-_]", {username});
  }
  let nUsername = normalizeUsername(username);

  if (await data.userIdForUsernameAsync(nUsername)) {
    throw clientError("USERNAME_TAKEN", "The username '" + username + "' is already taken.", {username: nUsername});
  }

  let userId = await makeUserIdForUsernameAsync(username);

  await writeSignupAsync(userId, nUsername, username, mobileNumber);

  let token = await session.newSessionAsync(userId);
  return {
    userId,
    token,
  };

}

module.exports = {
  USERNAME_REGEX,
  normalizeUsername,
  validateUsername,
  makeUserIdForUsernameAsync,
  signupUserAsync,
};




