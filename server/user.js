let data = require('./data');
let db = require('./db');

async function multigetUsersAsync(userIdList) {
  return await data.multigetObjectsAsync(userIdList, 'user');
}

async function getUserAsync(userId) {
  return data.getObjectAsync(userId, 'user');
}

async function userIdForNormalizedUsernameAsync(normalizedUsername) {
  let result = await db.queryAsync('SELECT userId FROM user WHERE normalizedUsername = ?', [
    normalizedUsername,
  ]);
  if (result.length > 0) {
    return result[0].userId;
  }
}

/**
 *
 * @param {normalizedPhoneNumber} number
 *
 * Returns the userId for the user with the given phone number.
 * Queries the database for this information.
 * Requires a *normalized* phone number; make sure to normalize first!
 *
 */
async function userIdForMobileNumberAsync(number) {
  let result = await db.queryAsync('SELECT userId FROM user WHERE mobileNumber = ?', [number]);
  if (result.length > 0) {
    return result[0].userId;
  }
}

async function confirmMobileNumberAsync(userId) {
  await db.queryAsync('UPDATE user SET mobileNumberConfirmed = 1 WHERE userId = ?', [userId]);
}

async function getAllUserIds() {
  let result = await db.queryAsync('SELECT userId FROM user');

  return result.map((r) => r.userId);
}

module.exports = {
  getUserAsync,
  multigetUsersAsync,
  userIdForNormalizedUsernameAsync,
  userIdForMobileNumberAsync,
  confirmMobileNumberAsync,
  getAllUserIds,
};
