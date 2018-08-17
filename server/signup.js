let clientError = require('./clientError');
let compactUuid = require('./compactUuid');
let contact = require('./contact');
let db = require('./db');
let session = require('./session');
let user = require('./user');
let username = require('./username');

async function userIdExistsAsync(userId) {
  let result = await db.queryAsync('SELECT userId FROM user WHERE userId = ?', [userId]);
  return result.length > 0;
}

async function makeUserIdForNormalizedUsernameAsync(normalizedUsername) {
  let x = 'user:' + normalizedUsername;
  // Yes this is susceptible to race conditions
  while (true) {
    if (await userIdExistsAsync(x)) {
      x += '+' + compactUuid.makeUuid();
    } else {
      break;
    }
  }
  return x;
}

async function writeSignupAsync(
  userId,
  normalizedUsername,
  displayUsername,
  normalizedMobileNumber
) {
  // TODO: Keep changing queries here (CDC)
  await db.queryAsync(
    'INSERT INTO user (userId, normalizedUsername, displayUsername, mobileNumber, createdTime, updatedTime) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, normalizedUsername, displayUsername, normalizedMobileNumber, new Date(), new Date()]
  );
}

async function doesUsernameExist(rawUsername) {
  if (!username.validateUsername(rawUsername)) {
    return false;
  }

  let normalizedUsername = username.normalizeUsername(rawUsername);

  if (await user.userIdForNormalizedUsernameAsync(normalizedUsername)) {
    return true;
  }
}

async function signupUserAsync(rawUsername, rawMobileNumber) {
  // Check to see if this user exists already (yes there is a race condition
  // that could happen here; we still need to check for failed writes)

  if (!username.validateUsername(rawUsername)) {
    throw clientError(
      'INVALID_USERNAME',
      "Invalid username '" +
        rawUsername +
        "'. Usernames must be between 2 and 80 characters and only contain [a-zA-Z0-9.-_]",
      { username: rawUsername }
    );
  }
  let normalizedUsername = username.normalizeUsername(rawUsername);

  if (await user.userIdForNormalizedUsernameAsync(normalizedUsername)) {
    throw clientError('USERNAME_TAKEN', "The username '" + rawUsername + "' is already taken.", {
      username: rawUsername,
      normalizedUsername,
    });
  }

  let userId = await makeUserIdForNormalizedUsernameAsync(normalizedUsername);

  let normalizedMobileNumber = null;
  if (rawMobileNumber) {
    normalizedMobileNumber = contact.normalizeMobileNumber(rawMobileNumber);
  }

  if (await user.userIdForMobileNumberAsync(normalizedMobileNumber)) {
    throw clientError(
      'MOBILE_NUMBER_IN_USER',
      'Another user is already using the mobile number ' + normalizedMobileNumber,
      { mobileNumber: normalizedMobileNumber }
    );
  }

  await writeSignupAsync(userId, normalizedUsername, rawUsername, normalizedMobileNumber);
  await contact.createNewMobileNumberAsync(userId, normalizedMobileNumber);

  return {
    userId,
    normalizedMobileNumber,
    normalizedUsername,
  };
}

module.exports = {
  makeUserIdForNormalizedUsernameAsync,
  signupUserAsync,
  doesUsernameExist,
};
